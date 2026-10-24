import assert from "node:assert/strict";
import { test } from "node:test";
import type { Subsistemas } from "../src/contratos.js";
import { FachadaPreparacao } from "../src/fachada.js";
import { criarSubsistemasEmMemoria } from "../src/subsistemas-em-memoria.js";

const pedido = { missao: "Recepção", refeicoes: 4, peca: "Fecho do corredor", rota: "Serviço" };

test("a fachada coordena dados, efeitos e dependências pela operação de alto nível", () => {
  const subsistemas = criarSubsistemasEmMemoria();
  const resultado = new FachadaPreparacao(subsistemas).prepararMissao(pedido);
  assert.equal(resultado.estado, "pronta");
  assert.deepEqual(resultado.etapas.map((etapa) => [etapa.nome, etapa.estado]), [
    ["cozinha", "concluida"], ["arsenal", "concluida"], ["arquivo", "concluida"], ["guarda", "concluida"],
  ]);
  assert.deepEqual(subsistemas.consultarEstado(), {
    estoque: [], chamadas: ["cozinha", "arsenal", "arquivo", "guarda"],
    refeicoes: [{ missao: "Recepção", quantidade: 4 }], reservas: [{ missao: "Recepção", peca: "Fecho do corredor" }],
    mapas: ["Serviço"], passagens: [{ missao: "Recepção", rota: "Serviço", mapa: "mapa:Serviço" }],
  });
});

test("falta de peça devolve parcial e preserva refeições e mapa sem chamar guarda", () => {
  const subsistemas = criarSubsistemasEmMemoria([]);
  const resultado = new FachadaPreparacao(subsistemas).prepararMissao(pedido);
  assert.equal(resultado.estado, "parcial");
  assert.deepEqual(resultado.etapas.map((etapa) => etapa.estado), ["concluida", "pendente", "concluida", "pendente"]);
  assert.deepEqual(subsistemas.consultarEstado().chamadas, ["cozinha", "arsenal", "arquivo"]);
  assert.equal(subsistemas.consultarEstado().refeicoes.length, 1);
  assert.equal(subsistemas.consultarEstado().mapas.length, 1);
});

test("falha do ferreiro é explícita e não desfaz a cozinha nem impede consulta de mapa", () => {
  const ambiente = criarSubsistemasEmMemoria();
  const subsistemas: Subsistemas = { ...ambiente, arsenal: { reservarPeca: () => { throw new Error("Ferreiro indisponível."); } } };
  const resultado = new FachadaPreparacao(subsistemas).prepararMissao(pedido);
  assert.equal(resultado.estado, "parcial");
  assert.deepEqual(resultado.etapas[1], { nome: "arsenal", estado: "falhou", detalhe: "Ferreiro indisponível." });
  assert.equal(resultado.etapas[3]?.estado, "pendente");
  assert.equal(ambiente.consultarEstado().refeicoes.length, 1);
  assert.deepEqual(ambiente.consultarEstado().mapas, ["Serviço"]);
});

test("falha do arquivo mantém reserva já consumida e deixa guarda pendente", () => {
  const ambiente = criarSubsistemasEmMemoria();
  const resultado = new FachadaPreparacao({ ...ambiente, arquivo: { buscarMapa: () => { throw new Error("Arquivo fechado."); } } }).prepararMissao(pedido);
  assert.equal(resultado.estado, "parcial");
  assert.equal(resultado.etapas[2]?.estado, "falhou");
  assert.equal(resultado.etapas[3]?.estado, "pendente");
  assert.equal(ambiente.consultarEstado().reservas.length, 1);
  assert.deepEqual(ambiente.consultarEstado().estoque, []);
});

test("falha da cozinha não bloqueia preparativos independentes, mas resultado continua parcial", () => {
  const ambiente = criarSubsistemasEmMemoria();
  const resultado = new FachadaPreparacao({ ...ambiente, cozinha: { prepararRefeicoes: () => { throw new Error("Forno parado."); } } }).prepararMissao(pedido);
  assert.equal(resultado.estado, "parcial");
  assert.equal(resultado.etapas[0]?.estado, "falhou");
  assert.equal(resultado.etapas[3]?.estado, "concluida");
  assert.equal(ambiente.consultarEstado().passagens.length, 1);
});

test("uma etapa pode alterar estado e depois falhar, sem desfazer o efeito já ocorrido", () => {
  const ambiente = criarSubsistemasEmMemoria();
  const resultado = new FachadaPreparacao({
    ...ambiente,
    cozinha: { prepararRefeicoes: (missao, quantidade) => {
      ambiente.cozinha.prepararRefeicoes(missao, quantidade);
      throw new Error("Falha depois do preparo.");
    } },
  }).prepararMissao(pedido);
  assert.equal(resultado.estado, "parcial");
  assert.equal(resultado.etapas[0]?.estado, "falhou");
  assert.deepEqual(ambiente.consultarEstado().refeicoes, [{ missao: "Recepção", quantidade: 4 }]);
});

test("guarda recusa mapa divergente e resultado relata sua falha sem rollback", () => {
  const ambiente = criarSubsistemasEmMemoria();
  const resultado = new FachadaPreparacao({ ...ambiente, arquivo: { buscarMapa: () => ({ rota: "Outra", referencia: "mapa:Outra" }) } }).prepararMissao(pedido);
  assert.equal(resultado.estado, "parcial");
  assert.deepEqual(resultado.etapas[3], { nome: "guarda", estado: "falhou", detalhe: "Mapa não corresponde à rota." });
  assert.equal(ambiente.consultarEstado().reservas.length, 1);
  assert.equal(ambiente.consultarEstado().passagens.length, 0);
});

test("zero refeições ignora cozinha explicitamente e pode concluir as demais etapas", () => {
  const subsistemas = criarSubsistemasEmMemoria();
  const resultado = new FachadaPreparacao(subsistemas).prepararMissao({ ...pedido, refeicoes: 0 });
  assert.equal(resultado.estado, "pronta");
  assert.equal(resultado.etapas[0]?.estado, "ignorada");
  assert.deepEqual(subsistemas.consultarEstado().chamadas, ["arsenal", "arquivo", "guarda"]);
});

test("repetir a operação não é idempotente nem uma retentativa automática", () => {
  const subsistemas = criarSubsistemasEmMemoria();
  const fachada = new FachadaPreparacao(subsistemas);
  assert.equal(fachada.prepararMissao(pedido).estado, "pronta");
  assert.equal(fachada.prepararMissao(pedido).estado, "parcial");
  const estado = subsistemas.consultarEstado();
  assert.equal(estado.refeicoes.length, 2);
  assert.equal(estado.reservas.length, 1);
  assert.equal(estado.mapas.length, 2);
  assert.equal(estado.passagens.length, 1);
});

for (const refeicoes of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
  test(`pedido com refeições ${refeicoes} é recusado antes dos efeitos`, () => {
    const subsistemas = criarSubsistemasEmMemoria();
    assert.throws(() => new FachadaPreparacao(subsistemas).prepararMissao({ ...pedido, refeicoes }), { message: "Refeições devem ser um inteiro não negativo seguro." });
    assert.deepEqual(subsistemas.consultarEstado().chamadas, []);
  });
}

test("nomes vazios são recusados e espaços são normalizados antes dos subsistemas", () => {
  const subsistemas = criarSubsistemasEmMemoria();
  const fachada = new FachadaPreparacao(subsistemas);
  assert.throws(() => fachada.prepararMissao({ ...pedido, rota: " " }), { message: "Missão, peça e rota são obrigatórias." });
  fachada.prepararMissao({ ...pedido, missao: " Recepção ", rota: " Serviço " });
  assert.deepEqual(subsistemas.consultarEstado().passagens, [{ missao: "Recepção", rota: "Serviço", mapa: "mapa:Serviço" }]);
});

test("subsistemas continuam disponíveis sem fachada quando a tarefa é direta", () => {
  const ambiente = criarSubsistemasEmMemoria();
  const mapa = ambiente.arquivo.buscarMapa("Pátio");
  assert.deepEqual(mapa, { rota: "Pátio", referencia: "mapa:Pátio" });
  assert.deepEqual(ambiente.consultarEstado().chamadas, ["arquivo"]);
});

test("resultado é congelado e consultas de efeitos são cópias defensivas", () => {
  const ambiente = criarSubsistemasEmMemoria();
  const resultado = new FachadaPreparacao(ambiente).prepararMissao(pedido);
  assert.equal(Object.isFrozen(resultado), true);
  assert.equal(Object.isFrozen(resultado.etapas), true);
  const etapa = resultado.etapas[0];
  assert.ok(etapa);
  assert.equal(Reflect.set(etapa, "estado", "ignorada"), false);
  const copia = ambiente.consultarEstado();
  copia.chamadas.pop();
  const refeicao = copia.refeicoes[0];
  assert.ok(refeicao);
  refeicao.quantidade = 90;
  assert.equal(ambiente.consultarEstado().chamadas.length, 4);
  assert.equal(ambiente.consultarEstado().refeicoes[0]?.quantidade, 4);
});
