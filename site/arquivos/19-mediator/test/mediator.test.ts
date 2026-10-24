import assert from "node:assert/strict";
import { test } from "node:test";
import { ConselhoMediator } from "../src/conselho.js";
import type { Equipe, Evento, Resultado } from "../src/contratos.js";
import { montarConselho } from "../src/montagem.js";

function instrumentar() {
  const conselho = new ConselhoMediator();
  const chamadas: string[] = [];
  const equipe: Equipe = {
    cultivadores: { solicitarInspecao: () => { chamadas.push("cultivadores.inspecao"); } },
    barqueiros: { solicitarAmarras: () => { chamadas.push("barqueiros.amarras"); } },
    guarda: { solicitarAutorizacao: () => { chamadas.push("guarda.autorizacao"); }, abrir: () => { chamadas.push("guarda.abrir"); } },
  };
  conselho.conectar(equipe);
  return { conselho, chamadas, equipe };
}

const fluxo: Evento[] = [{ tipo: "pedido" }, { tipo: "inspecao", aprovada: true },
  { tipo: "amarras", confirmadas: true }, { tipo: "autorizacao", concedida: true }];

test("cada evento dirige somente a ação necessária, na ordem das pré-condições", () => {
  const { conselho, chamadas } = instrumentar();
  const esperadas = ["cultivadores.inspecao", "barqueiros.amarras", "guarda.autorizacao", "guarda.abrir"];
  for (const [indice, evento] of fluxo.entries()) {
    assert.equal(conselho.notificar(evento).status, "processado");
    assert.deepEqual(chamadas, esperadas.slice(0, indice + 1));
  }
  assert.equal(conselho.snapshot().estado, "aberto");
  assert.deepEqual(conselho.snapshot().despachos.map((item) => [item.destinatario, item.acao]), [
    ["cultivadores", "solicitarInspecao"], ["barqueiros", "solicitarAmarras"], ["guarda", "solicitarAutorizacao"], ["guarda", "abrir"],
  ]);
});

test("confirmações precoces ou fora de ordem são rejeitadas sem despacho ou mudança de etapa", () => {
  const { conselho, chamadas } = instrumentar();
  for (const evento of fluxo.slice(1)) assert.equal(conselho.notificar(evento).status, "rejeitado");
  assert.deepEqual(chamadas, []);
  conselho.notificar(fluxo[0]!);
  const antes = conselho.snapshot();
  assert.equal(conselho.notificar(fluxo[3]!).status, "rejeitado");
  assert.equal(conselho.notificar(fluxo[2]!).status, "rejeitado");
  assert.deepEqual(conselho.snapshot(), antes);
});

test("repetir pedido ou confirmação já consumida não dispara destinatários novamente", () => {
  const { conselho, chamadas } = instrumentar();
  for (const evento of fluxo) {
    conselho.notificar(evento);
    const antes = conselho.snapshot();
    assert.equal(conselho.notificar(evento).status, "rejeitado");
    assert.deepEqual(conselho.snapshot(), antes);
  }
  assert.equal(chamadas.length, 4);
  assert.equal(conselho.notificar({ tipo: "pedido" }).status, "rejeitado");
});

test("confirmação recebida sem tipo não usa string truthy no lugar de booleano", () => {
  const { conselho } = instrumentar();
  conselho.notificar(fluxo[0]!);
  for (const [valida, invalida] of [
    [fluxo[1]!, { tipo: "inspecao", aprovada: "false" }],
    [fluxo[2]!, { tipo: "amarras", confirmadas: 1 }],
    [fluxo[3]!, { tipo: "autorizacao", concedida: "sim" }],
  ] as const) {
    const antes = conselho.snapshot();
    assert.equal(conselho.notificar(invalida as unknown as Evento).status, "rejeitado");
    assert.deepEqual(conselho.snapshot(), antes);
    assert.equal(conselho.notificar(valida).status, "processado");
  }
});

for (const [indice, negativa] of [[1, { tipo: "inspecao", aprovada: false }],
  [2, { tipo: "amarras", confirmadas: false }], [3, { tipo: "autorizacao", concedida: false }]] as const) {
  test(`confirmação negativa de ${negativa.tipo} encerra recusado sem abertura`, () => {
    const { conselho, chamadas } = instrumentar();
    for (const evento of fluxo.slice(0, indice)) conselho.notificar(evento);
    const resultado = conselho.notificar(negativa);
    assert.equal(resultado.status, "processado");
    assert.equal(resultado.estado, "recusado");
    assert.equal(chamadas.includes("guarda.abrir"), false);
    const antes = [...chamadas];
    for (const evento of fluxo) assert.equal(conselho.notificar(evento).status, "rejeitado");
    assert.deepEqual(chamadas, antes);
  });
}

test("colegas conhecem mediador e seus estados mudam somente nas ações dirigidas", () => {
  const posto = montarConselho();
  posto.barqueiros.pedirAbertura();
  assert.equal(posto.cultivadores.snapshot().solicitacoesInspecao, 1);
  assert.equal(posto.barqueiros.snapshot().solicitacoesAmarras, 0);
  assert.equal(posto.guarda.snapshot().solicitacoesAutorizacao, 0);
  posto.cultivadores.confirmarInspecao(true);
  posto.barqueiros.confirmarAmarras(true);
  assert.equal(posto.guarda.snapshot().aberta, false);
  posto.guarda.confirmarAutorizacao(true);
  assert.deepEqual(posto.guarda.snapshot(), { solicitacoesAutorizacao: 1, acionamentos: 1, aberta: true });
});

test("falha após iniciar acionamento conserva efeito parcial, não fabrica aberto nem faz retentativa", () => {
  const posto = montarConselho(true);
  posto.barqueiros.pedirAbertura();
  posto.cultivadores.confirmarInspecao(true);
  posto.barqueiros.confirmarAmarras(true);
  const resultado = posto.guarda.confirmarAutorizacao(true);
  assert.deepEqual(resultado, { status: "falhou", estado: "falhou", motivo: "Falha simulada após iniciar acionamento." });
  assert.equal(posto.guarda.snapshot().acionamentos, 1);
  assert.equal(posto.guarda.snapshot().aberta, false);
  assert.deepEqual(posto.conselho.snapshot().despachos.at(-1), { destinatario: "guarda", acao: "abrir", status: "falhou" });
  assert.equal(posto.guarda.confirmarAutorizacao(true).status, "rejeitado");
  assert.equal(posto.guarda.snapshot().acionamentos, 1);
});

test("erro em destinatário anterior também encerra e impede etapas posteriores", () => {
  const conselho = new ConselhoMediator();
  let amarras = 0;
  conselho.conectar({ cultivadores: { solicitarInspecao: () => { throw new Error("Indisponível."); } },
    barqueiros: { solicitarAmarras: () => { amarras += 1; } }, guarda: { solicitarAutorizacao() {}, abrir() {} } });
  assert.equal(conselho.notificar({ tipo: "pedido" }).status, "falhou");
  assert.equal(conselho.notificar({ tipo: "inspecao", aprovada: true }).status, "rejeitado");
  assert.equal(amarras, 0);
});

test("equipe conecta uma vez; referência de montagem copiada não troca destinatários", () => {
  const vazio = new ConselhoMediator();
  assert.equal(vazio.notificar({ tipo: "pedido" }).status, "rejeitado");
  const { conselho, equipe, chamadas } = instrumentar();
  assert.throws(() => conselho.conectar(equipe));
  const mutavel = equipe as { cultivadores: { solicitarInspecao(): void } };
  mutavel.cultivadores = { solicitarInspecao: () => { throw new Error("Troca externa."); } };
  assert.equal(conselho.notificar({ tipo: "pedido" }).status, "processado");
  assert.deepEqual(chamadas, ["cultivadores.inspecao"]);
});

test("notificação reentrante durante despacho é rejeitada sem antecipar confirmação", () => {
  const conselho = new ConselhoMediator();
  const internos: Resultado[] = [];
  conselho.conectar({ cultivadores: { solicitarInspecao: () => { internos.push(conselho.notificar({ tipo: "inspecao", aprovada: true })); } },
    barqueiros: { solicitarAmarras() {} }, guarda: { solicitarAutorizacao() {}, abrir() {} } });
  conselho.notificar({ tipo: "pedido" });
  assert.equal(internos[0]!.status, "rejeitado");
  assert.equal(conselho.snapshot().estado, "aguardando-inspecao");
});

test("nova operação usa composição nova e não herda confirmações da anterior", () => {
  const anterior = montarConselho();
  anterior.barqueiros.pedirAbertura(); anterior.cultivadores.confirmarInspecao(true);
  anterior.barqueiros.confirmarAmarras(true); anterior.guarda.confirmarAutorizacao(true);
  const nova = montarConselho();
  assert.equal(nova.guarda.confirmarAutorizacao(true).status, "rejeitado");
  assert.equal(anterior.guarda.confirmarAutorizacao(true).status, "rejeitado");
  assert.equal(nova.guarda.snapshot().aberta, false);
});

test("snapshots/resultados congelados não alteram coordenação ou registros anteriores", () => {
  const posto = montarConselho();
  const resultado = posto.barqueiros.pedirAbertura();
  const visao = posto.conselho.snapshot();
  assert.equal(Reflect.set(resultado, "estado", "aberto"), false);
  assert.equal(Reflect.set(visao, "estado", "aberto"), false);
  assert.equal(Reflect.set(visao.despachos, "0", {}), false);
  assert.equal(Reflect.set(visao.despachos[0]!, "acao", "abrir"), false);
  posto.cultivadores.confirmarInspecao(true);
  assert.equal(visao.despachos.length, 1);
  assert.equal(posto.conselho.snapshot().despachos.length, 2);
});

test("tipo de evento não autentica remetente e métodos públicos do receptor não são barreira de segurança", () => {
  const posto = montarConselho();
  posto.guarda.abrir(); // Cliente que possui o receptor pode ignorar o protocolo didático.
  assert.equal(posto.guarda.snapshot().aberta, true);
  assert.equal(posto.conselho.snapshot().estado, "pronto");
});
