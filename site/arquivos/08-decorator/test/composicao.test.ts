import assert from "node:assert/strict";
import { test } from "node:test";
import type { Ataque } from "../src/contratos.js";
import { calcularPotenciaDireta } from "../src/direto.js";
import { Espada } from "../src/espada.js";
import { MantoAmplificador, MantoDeCalor } from "../src/mantos.js";

test("o núcleo funciona sozinho pelo mesmo contrato dos wrappers", () => {
  const ataque: Ataque = new Espada(10);
  assert.deepEqual(ataque.executar(), { potencia: 10, efeitos: ["espada"] });
});

test("calor antes da amplificação aplica (10 + 3) * 2 e registra essa ordem", () => {
  const ataque = new MantoAmplificador(new MantoDeCalor(new Espada(10), 3), 2);
  assert.deepEqual(ataque.executar(), { potencia: 26, efeitos: ["espada", "calor +3", "amplificação x2"] });
});

test("inverter as camadas aplica 10 * 2 + 3, resultado e efeitos distintos", () => {
  const ataque = new MantoDeCalor(new MantoAmplificador(new Espada(10), 2), 3);
  assert.deepEqual(ataque.executar(), { potencia: 23, efeitos: ["espada", "amplificação x2", "calor +3"] });
});

test("reconstruir para retirar uma camada não altera núcleo nem composição anterior", () => {
  const espada = new Espada(10);
  const completa = new MantoAmplificador(new MantoDeCalor(espada, 3), 2);
  const semAmplificador = new MantoDeCalor(espada, 3);
  assert.equal(semAmplificador.executar().potencia, 13);
  assert.equal(espada.executar().potencia, 10);
  assert.equal(completa.executar().potencia, 26);
});

test("camadas repetidas são permitidas e acumulam sem deduplicação", () => {
  const espada = new Espada(10);
  assert.deepEqual(new MantoDeCalor(new MantoDeCalor(espada, 3), 3).executar(), {
    potencia: 16, efeitos: ["espada", "calor +3", "calor +3"],
  });
  assert.equal(new MantoAmplificador(new MantoAmplificador(espada, 2), 2).executar().potencia, 40);
});

test("reusar a composição não acumula efeitos entre execuções", () => {
  const ataque = new MantoAmplificador(new MantoDeCalor(new Espada(10), 3), 2);
  const primeiro = ataque.executar();
  const segundo = ataque.executar();
  assert.deepEqual(primeiro, segundo);
  assert.notEqual(primeiro, segundo);
  assert.notEqual(primeiro.efeitos, segundo.efeitos);
});

test("wrapper delega uma vez e não altera o resultado recebido do componente", () => {
  let chamadas = 0;
  const efeitos = ["núcleo externo"];
  const interno: Ataque = { executar: () => { chamadas++; return { potencia: 10, efeitos }; } };
  const resultado = new MantoDeCalor(interno, 3).executar();
  assert.equal(chamadas, 1);
  assert.deepEqual(efeitos, ["núcleo externo"]);
  efeitos.push("Alteração posterior");
  assert.deepEqual(resultado.efeitos, ["núcleo externo", "calor +3"]);
});

test("resultado e lista de efeitos são congelados em execução", () => {
  const resultado = new MantoDeCalor(new Espada(), 3).executar();
  assert.equal(Reflect.set(resultado, "potencia", 99), false);
  assert.throws(() => (resultado.efeitos as string[]).pop(), TypeError);
});

for (const valor of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
  test(`potência e bônus ${valor} são recusados`, () => {
    assert.throws(() => new Espada(valor), { message: "Potência deve ser inteiro seguro maior ou igual a 0." });
    assert.throws(() => new MantoDeCalor(new Espada(), valor), { message: "Bônus deve ser inteiro seguro maior ou igual a 0." });
  });
}

test("fator zero ou fracionário é recusado; bônus zero, potência zero e fator um são válidos", () => {
  for (const fator of [0, 1.5]) assert.throws(() => new MantoAmplificador(new Espada(), fator), { message: "Fator deve ser inteiro seguro maior ou igual a 1." });
  assert.equal(new MantoAmplificador(new MantoDeCalor(new Espada(0), 0), 1).executar().potencia, 0);
});

test("overflow por adição ou multiplicação é recusado sem alterar o núcleo", () => {
  const espada = new Espada(Number.MAX_SAFE_INTEGER);
  assert.throws(() => new MantoDeCalor(espada, 1).executar(), { message: "Potência deve ser inteiro seguro maior ou igual a 0." });
  assert.throws(() => new MantoAmplificador(espada, 2).executar(), { message: "Potência deve ser inteiro seguro maior ou igual a 0." });
  assert.equal(espada.executar().potencia, Number.MAX_SAFE_INTEGER);
});

test("decoradores recusam resultado numérico inválido de componente externo antes da operação", () => {
  const externo: Ataque = { executar: () => ({ potencia: 0.5, efeitos: [] }) };
  assert.throws(() => new MantoAmplificador(externo, 2).executar(), { message: "Potência deve ser inteiro seguro maior ou igual a 0." });
  assert.throws(() => new MantoDeCalor(externo, 1).executar(), { message: "Potência deve ser inteiro seguro maior ou igual a 0." });
});

test("função direta reproduz a fórmula fixa sem precisar de wrappers", () => {
  assert.equal(calcularPotenciaDireta(10, 3, 2), 26);
  assert.throws(() => calcularPotenciaDireta(Number.MAX_SAFE_INTEGER, 1, 2), { message: "Potência deve ser inteiro seguro maior ou igual a 0." });
});
