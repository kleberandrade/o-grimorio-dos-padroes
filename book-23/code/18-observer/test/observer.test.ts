import assert from "node:assert/strict";
import { test } from "node:test";
import { Oraculo } from "../src/oraculo.js";
import type { Aviso, Desligar, Relatorio } from "../src/oraculo.js";

const aviso = { mensagem: "Rajada prevista.", local: "Praça" };

test("callbacks reagem com dados distintos e em ordem de inscrição", () => {
  const oraculo = new Oraculo();
  const publicacoes: string[] = [];
  let abrigoAberto = false;
  const ordem: string[] = [];
  oraculo.inscrever("Escriba", (dado) => { ordem.push("escriba"); publicacoes.push(dado.mensagem); });
  oraculo.inscrever("Salão", () => { ordem.push("salão"); abrigoAberto = true; });
  const relatorio = oraculo.emitir(aviso);
  assert.deepEqual(ordem, ["escriba", "salão"]);
  assert.deepEqual(publicacoes, [aviso.mensagem]);
  assert.equal(abrigoAberto, true);
  assert.deepEqual(relatorio.reacoes, [{ nome: "Escriba", status: "concluiu" }, { nome: "Salão", status: "concluiu" }]);
});

test("unsubscribe remove somente sua inscrição e é repetível sem efeitos extras", () => {
  const oraculo = new Oraculo();
  let chamados = 0;
  const desligar = oraculo.inscrever("Casa aposentada", () => { chamados += 1; });
  oraculo.emitir(aviso);
  assert.equal(desligar(), true);
  assert.equal(desligar(), false);
  assert.deepEqual(oraculo.emitir(aviso).reacoes, []);
  assert.equal(chamados, 1);
  assert.equal(oraculo.numeroInscricoes(), 0);
});

test("mesma função ativa é duplicata; funções distintas podem ter o mesmo nome", () => {
  const oraculo = new Oraculo();
  const observar = () => {};
  oraculo.inscrever("Arauto", observar);
  assert.throws(() => oraculo.inscrever("Outro nome", observar), { message: "Observador já inscrito." });
  oraculo.inscrever("Arauto", () => {});
  assert.equal(oraculo.emitir(aviso).reacoes.length, 2);
});

test("unsubscribe antigo não remove reinscrição da mesma função", () => {
  const oraculo = new Oraculo();
  const observar = () => {};
  const antigo = oraculo.inscrever("Antigo", observar);
  antigo();
  const novo = oraculo.inscrever("Novo", observar);
  assert.equal(antigo(), false);
  assert.deepEqual(oraculo.emitir(aviso).reacoes, [{ nome: "Novo", status: "concluiu" }]);
  assert.equal(novo(), true);
});

test("remoção antes do callback preserva rodada atual e altera só a próxima", () => {
  const oraculo = new Oraculo();
  const chamadas: string[] = [];
  let retirarSegundo: Desligar = () => false;
  oraculo.inscrever("Primeiro", () => { chamadas.push("primeiro"); retirarSegundo(); });
  retirarSegundo = oraculo.inscrever("Segundo", () => { chamadas.push("segundo"); });
  oraculo.emitir(aviso);
  oraculo.emitir(aviso);
  assert.deepEqual(chamadas, ["primeiro", "segundo", "primeiro"]);
});

test("inclusão durante callback entra somente na próxima rodada em sua nova posição", () => {
  const oraculo = new Oraculo();
  const chamadas: string[] = [];
  let incluido = false;
  oraculo.inscrever("Primeiro", () => {
    chamadas.push("primeiro");
    if (!incluido) { oraculo.inscrever("Novo", () => { chamadas.push("novo"); }); incluido = true; }
  });
  oraculo.inscrever("Segundo", () => { chamadas.push("segundo"); });
  oraculo.emitir(aviso);
  assert.deepEqual(chamadas, ["primeiro", "segundo"]);
  oraculo.emitir(aviso);
  assert.deepEqual(chamadas, ["primeiro", "segundo", "primeiro", "segundo", "novo"]);
});

test("remover e reinscrever durante emissão não duplica a rodada nem permite handle antigo apagar nova", () => {
  const oraculo = new Oraculo();
  let feitas = 0;
  let trocou = false;
  let antigo: Desligar = () => false;
  const observar = () => { feitas += 1; };
  oraculo.inscrever("Troca", () => {
    if (!trocou) { antigo(); oraculo.inscrever("Reinscrito", observar); trocou = true; }
  });
  antigo = oraculo.inscrever("Original", observar);
  assert.deepEqual(oraculo.emitir(aviso).reacoes.map((item) => item.nome), ["Troca", "Original"]);
  assert.equal(antigo(), false);
  assert.deepEqual(oraculo.emitir(aviso).reacoes.map((item) => item.nome), ["Troca", "Reinscrito"]);
  assert.equal(feitas, 2);
});

test("falhas síncronas são coletadas sem impedir outros, inclusive valor lançado sem Error", () => {
  const oraculo = new Oraculo();
  let publicou = false;
  oraculo.inscrever("Sino", () => { throw new Error("Cabo rompido."); });
  oraculo.inscrever("Valor lançado", () => { throw "falha"; });
  oraculo.inscrever("Escriba", () => { publicou = true; });
  assert.deepEqual(oraculo.emitir(aviso).reacoes, [
    { nome: "Sino", status: "falhou", motivo: "Cabo rompido." },
    { nome: "Valor lançado", status: "falhou", motivo: "Falha sem mensagem de Error." },
    { nome: "Escriba", status: "concluiu" },
  ]);
  assert.equal(publicou, true);
});

test("falha ao ler mensagem do erro usa fallback sem interromper próximos callbacks", () => {
  const oraculo = new Oraculo();
  const erro = new Error();
  Object.defineProperty(erro, "message", { get() { throw new Error("Getter falhou."); } });
  oraculo.inscrever("Falhou", () => { throw erro; });
  oraculo.inscrever("Seguinte", () => {});
  assert.deepEqual(oraculo.emitir(aviso).reacoes, [
    { nome: "Falhou", status: "falhou", motivo: "Falha ao ler mensagem do erro." },
    { nome: "Seguinte", status: "concluiu" },
  ]);
});

test("reentrância não capturada vira falha do callback e emissão posterior continua possível", () => {
  const oraculo = new Oraculo();
  let seguintes = 0;
  oraculo.inscrever("Recursivo", () => { oraculo.emitir(aviso); });
  oraculo.inscrever("Seguinte", () => { seguintes += 1; });
  for (let rodada = 0; rodada < 2; rodada += 1) {
    assert.deepEqual(oraculo.emitir(aviso).reacoes, [
      { nome: "Recursivo", status: "falhou", motivo: "Emissão reentrante recusada neste oráculo." },
      { nome: "Seguinte", status: "concluiu" },
    ]);
  }
  assert.equal(seguintes, 2);
});

test("ciclo entre dois oráculos termina na recusa do que já está emitindo", () => {
  const primeiro = new Oraculo();
  const segundo = new Oraculo();
  const internos: Relatorio[] = [];
  primeiro.inscrever("Vai", () => { internos.push(segundo.emitir(aviso)); });
  segundo.inscrever("Volta", () => { primeiro.emitir(aviso); });
  const externo = primeiro.emitir(aviso);
  assert.equal(externo.reacoes[0]!.status, "concluiu");
  assert.deepEqual(internos[0]!.reacoes, [{ nome: "Volta", status: "falhou", motivo: "Emissão reentrante recusada neste oráculo." }]);
});

test("aviso é copiado/congelado e observadores não alteram dado recebido pelos seguintes", () => {
  const oraculo = new Oraculo();
  const entrada = { mensagem: " Rajada. ", local: " Praça " };
  let recebido: Aviso | undefined;
  oraculo.inscrever("Tenta mutar", (dado) => { assert.equal(Reflect.set(dado, "mensagem", "alterado"), false); });
  oraculo.inscrever("Lê", (dado) => { recebido = dado; });
  const relatorio = oraculo.emitir(entrada);
  entrada.mensagem = "Mudou depois";
  assert.deepEqual(recebido, { mensagem: "Rajada.", local: "Praça" });
  assert.notEqual(relatorio.aviso, entrada);
  assert.equal(Reflect.set(relatorio, "reacoes", []), false);
  assert.equal(Reflect.set(relatorio.reacoes, "0", {}), false);
  assert.equal(Reflect.set(relatorio.reacoes[0]!, "status", "falhou"), false);
});

test("entradas vazias são recusadas sem chamadas e não bloqueiam próxima emissão válida", () => {
  const oraculo = new Oraculo();
  let chamadas = 0;
  assert.throws(() => oraculo.inscrever(" ", () => {}));
  oraculo.inscrever("Válido", () => { chamadas += 1; });
  assert.throws(() => oraculo.emitir({ mensagem: " ", local: "Praça" }));
  assert.throws(() => oraculo.emitir({ mensagem: "Mensagem", local: " " }));
  assert.equal(chamadas, 0);
  oraculo.emitir(aviso);
  assert.equal(chamadas, 1);
});
