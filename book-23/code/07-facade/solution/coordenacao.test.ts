import assert from "node:assert/strict";
import { test } from "node:test";
import { FachadaPreparacao } from "../src/fachada.js";
import { criarSubsistemasEmMemoria } from "../src/subsistemas-em-memoria.js";
import { coordenarVisita } from "./coordenacao.js";

const pedido = { missao: "Recepção", refeicoes: 4, peca: "Fecho do corredor", rota: "Serviço" };

test("decisão diplomática negativa não aciona preparação", () => {
  const ambiente = criarSubsistemasEmMemoria();
  const resultado = coordenarVisita(new FachadaPreparacao(ambiente), {
    consultarAutorizacao: (missao) => { assert.equal(missao, "Recepção"); return { permitida: false, motivo: "Acordo pendente." }; },
  }, pedido);
  assert.deepEqual(resultado, { estado: "nao-autorizada", motivo: "Acordo pendente." });
  assert.deepEqual(ambiente.consultarEstado().chamadas, []);
});

test("autorização externa não transforma preparação parcial em pronta", () => {
  const ambiente = criarSubsistemasEmMemoria([]);
  const resultado = coordenarVisita(new FachadaPreparacao(ambiente), {
    consultarAutorizacao: () => ({ permitida: true, motivo: "Decisão externa." }),
  }, pedido);
  assert.equal(resultado.estado, "autorizada");
  if (resultado.estado !== "autorizada") throw new Error("Resultado inesperado.");
  assert.equal(resultado.preparacao.estado, "parcial");
  assert.equal(ambiente.consultarEstado().refeicoes.length, 1);
});
