import assert from "node:assert/strict";
import { test } from "node:test";
import type { Encantamento, Etapa } from "../src/contratos.js";
import { RitualFogo, RitualGelo } from "../src/ritual.js";
import { realizarComCallback } from "../src/funcao.js";

const ordem: Etapa[] = ["prepararIngredientes", "conjurarEncantamento", "selar"];

class RitualObservado extends RitualFogo {
  readonly chamadas: Etapa[] = [];
  readonly #falha: Etapa | null;
  constructor(falha: Etapa | null = null) { super(); this.#falha = falha; }
  private registrar(etapa: Etapa): void {
    this.chamadas.push(etapa);
    if (this.#falha === etapa) throw new Error(`Falha em ${etapa}.`);
  }
  protected override prepararIngredientes(ingredientes: readonly string[]): readonly string[] {
    this.registrar("prepararIngredientes");
    return super.prepararIngredientes(ingredientes);
  }
  protected override conjurarEncantamento(ingredientes: readonly string[]): Encantamento {
    this.registrar("conjurarEncantamento");
    assert.deepEqual(ingredientes, ["água", "sal arcano"]);
    return super.conjurarEncantamento(ingredientes);
  }
  protected override selar(encantamento: Encantamento): string {
    this.registrar("selar");
    assert.equal(encantamento.elemento, "fogo");
    return super.selar(encantamento);
  }
}

test("a base chama as etapas na ordem e produz lote com encantamento e selo", () => {
  const ritual = new RitualObservado();
  const resultado = ritual.realizar([" água ", "sal arcano"]);
  assert.equal(resultado.status, "concluido");
  assert.deepEqual(ritual.chamadas, ordem);
  assert.deepEqual(resultado.etapasConcluidas, ordem);
  assert.deepEqual(resultado.lote, { ingredientesPreparados: ["água", "sal arcano"],
    encantamento: { elemento: "fogo", efeito: "aquecimento modelado" }, selo: "selo de fogo" });
});

test("fogo e gelo variam o encantamento conservando a sequência e o selo correspondente", () => {
  const fogo = new RitualFogo().realizar(["água"]);
  const gelo = new RitualGelo().realizar(["água"]);
  assert.deepEqual(fogo.etapasConcluidas, gelo.etapasConcluidas);
  assert.equal(fogo.lote.encantamento?.elemento, "fogo");
  assert.equal(gelo.lote.encantamento?.efeito, "resfriamento modelado");
  assert.equal(gelo.lote.selo, "selo de gelo");
});

for (const [indice, etapa] of ordem.entries()) {
  test(`falha em ${etapa} interrompe etapas posteriores e não fabrica selo ou conclusão`, () => {
    const ritual = new RitualObservado(etapa);
    const resultado = ritual.realizar(["água", "sal arcano"]);
    assert.equal(resultado.status, "falhou");
    if (resultado.status !== "falhou") assert.fail("Esperada falha.");
    assert.equal(resultado.etapaFalha, etapa);
    assert.equal(resultado.motivo, `Falha em ${etapa}.`);
    assert.deepEqual(ritual.chamadas, ordem.slice(0, indice + 1));
    assert.deepEqual(resultado.etapasConcluidas, ordem.slice(0, indice));
    assert.equal(resultado.lote.selo, null);
    assert.deepEqual(resultado.lote.ingredientesPreparados, indice > 0 ? ["água", "sal arcano"] : null);
    assert.equal(resultado.lote.encantamento?.elemento ?? null, indice > 1 ? "fogo" : null);
    // A chamada à etapa que falhou continua no observador: não houve rollback.
    assert.equal(ritual.chamadas.at(-1), etapa);
  });
}

test("ingredientes vazios ou sem nome falham na preparação", () => {
  for (const ingredientes of [[], [" "]]) {
    const resultado = new RitualFogo().realizar(ingredientes);
    assert.equal(resultado.status, "falhou");
    assert.deepEqual(resultado.etapasConcluidas, []);
    assert.equal(resultado.lote.encantamento, null);
    assert.equal(resultado.lote.selo, null);
  }
});

test("entrada, resultados anteriores e execuções independentes não compartilham listas mutáveis", () => {
  const entrada = ["água"];
  const ritual = new RitualFogo();
  const primeiro = ritual.realizar(entrada);
  entrada[0] = "outro ingrediente";
  const segundo = ritual.realizar(entrada);
  assert.deepEqual(primeiro.lote.ingredientesPreparados, ["água"]);
  assert.deepEqual(segundo.lote.ingredientesPreparados, ["outro ingrediente"]);
  assert.notEqual(primeiro.lote, segundo.lote);
  assert.notEqual(primeiro.lote.ingredientesPreparados, segundo.lote.ingredientesPreparados);
  assert.equal(Reflect.set(primeiro, "status", "falhou"), false);
  assert.equal(Reflect.set(primeiro.lote, "selo", null), false);
  assert.equal(Reflect.set(primeiro.etapasConcluidas, "0", "selar"), false);
  assert.equal(Reflect.set(primeiro.lote.ingredientesPreparados!, "0", "alterado"), false);
  assert.equal(Reflect.set(primeiro.lote.encantamento!, "elemento", "gelo"), false);
});

test("falha anterior não contamina execução posterior do mesmo ritual", () => {
  const ritual = new RitualFogo();
  assert.equal(ritual.realizar([]).status, "falhou");
  assert.equal(ritual.realizar(["água"]).status, "concluido");
});

test("função com callback é alternativa executável com o mesmo contrato de dados e falha", () => {
  for (const ritual of [new RitualFogo(), new RitualGelo()]) {
    const referencia = ritual.realizar(["água"]);
    assert.notEqual(referencia.lote.encantamento, null);
    const encantamento = referencia.lote.encantamento!;
    assert.deepEqual(realizarComCallback(["água"], () => encantamento), referencia);
    assert.deepEqual(realizarComCallback([], () => encantamento), ritual.realizar([]));
  }
  const falha = realizarComCallback(["água"], () => { throw new Error("Sem encantamento."); });
  assert.equal(falha.status, "falhou");
  assert.deepEqual(falha.etapasConcluidas, ["prepararIngredientes"]);
  assert.equal(falha.lote.selo, null);
});
