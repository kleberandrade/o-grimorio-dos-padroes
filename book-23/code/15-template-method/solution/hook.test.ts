import assert from "node:assert/strict";
import { test } from "node:test";
import { RitualFogoInspecionado, RitualGeloComHookPadrao } from "./inspecao.js";

test("hook acrescentado entre conjuração e selo pode recusar sem selo fictício", () => {
  const resultado = new RitualFogoInspecionado(false).realizar(["água"]);
  assert.equal(resultado.status, "falhou");
  if (resultado.status !== "falhou") assert.fail("Esperada falha.");
  assert.equal(resultado.etapaFalha, "aposEncantamento");
  assert.equal(resultado.motivo, "Inspeção modelada recusou o lote.");
  assert.deepEqual(resultado.etapasConcluidas, ["prepararIngredientes", "conjurarEncantamento"]);
  assert.equal(resultado.lote.encantamento?.elemento, "fogo");
  assert.equal(resultado.lote.selo, null);
});

test("hook aprovado executa antes do selo e conclui todas as quatro etapas", () => {
  const resultado = new RitualFogoInspecionado(true).realizar(["água"]);
  assert.equal(resultado.status, "concluido");
  assert.deepEqual(resultado.etapasConcluidas,
    ["prepararIngredientes", "conjurarEncantamento", "aposEncantamento", "selar"]);
  assert.equal(resultado.lote.selo, "selo de fogo");
});

test("hook padrão vazio é opcional para subclasse e conserva preparação/encantamento/selagem", () => {
  const resultado = new RitualGeloComHookPadrao().realizar(["água"]);
  assert.equal(resultado.status, "concluido");
  assert.equal(resultado.lote.selo, "selo de gelo");
  assert.deepEqual(resultado.etapasConcluidas,
    ["prepararIngredientes", "conjurarEncantamento", "aposEncantamento", "selar"]);
});
