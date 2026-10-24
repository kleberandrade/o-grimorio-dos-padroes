import assert from "node:assert/strict";
import { test } from "node:test";
import { ArmaDeBrasa, FabricaDeBrasa, ProtecaoDeBrasa } from "../src/brasa.js";
import { ensaiarKit } from "../src/cliente.js";
import type { FabricaElemental } from "../src/contratos.js";
import { ArmaDeGeada, FabricaDeGeada, ProtecaoDeGeada } from "../src/geada.js";

for (const [afinidade, fabrica] of [
  ["brasa", new FabricaDeBrasa()],
  ["geada", new FabricaDeGeada()],
] as const) {
  test(`${afinidade}: produtos cooperam no mesmo contrato de ensaio`, () => {
    const arma = fabrica.criarArma();
    const protecao = fabrica.criarProtecao();
    const resultado = protecao.ensaiar(arma.emitirPulso(3));
    assert.deepEqual(resultado, {
      afinidade,
      arma: `Lâmina de ${afinidade}`,
      protecao: `Escudo de ${afinidade}`,
      intensidade: 3,
    });
    assert.equal(Object.isFrozen(resultado), true);
  });
}

test("trocar a fábrica troca a família completa sem alterar o cliente", () => {
  const fabricas: FabricaElemental[] = [new FabricaDeBrasa(), new FabricaDeGeada()];
  const resultados = fabricas.map((fabrica) => ensaiarKit(fabrica, 2));
  assert.deepEqual(resultados, [
    { afinidade: "brasa", arma: "Lâmina de brasa", protecao: "Escudo de brasa", intensidade: 2 },
    { afinidade: "geada", arma: "Lâmina de geada", protecao: "Escudo de geada", intensidade: 2 },
  ]);
});

test("arma de brasa e proteção de geada são rejeitadas explicitamente", () => {
  const pulso = new ArmaDeBrasa().emitirPulso(3);
  assert.throws(() => new ProtecaoDeGeada().ensaiar(pulso), { message: "Afinidades incompatíveis: brasa / geada." });
});

test("a mistura inversa também é rejeitada", () => {
  const pulso = new ArmaDeGeada().emitirPulso(3);
  assert.throws(() => new ProtecaoDeBrasa().ensaiar(pulso), { message: "Afinidades incompatíveis: geada / brasa." });
});

test("o contrato estático da fábrica permite implementação incoerente; o ensaio rejeita em runtime", () => {
  const fabricaIncoerente: FabricaElemental = {
    criarArma: () => new ArmaDeBrasa(),
    criarProtecao: () => new ProtecaoDeGeada(),
  };
  assert.throws(() => ensaiarKit(fabricaIncoerente, 3), { message: "Afinidades incompatíveis: brasa / geada." });
});

for (const intensidade of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
  test(`intensidade ${intensidade} é rejeitada nas duas famílias`, () => {
    for (const fabrica of [new FabricaDeBrasa(), new FabricaDeGeada()]) {
      assert.throws(() => ensaiarKit(fabrica, intensidade), { message: "Intensidade deve ser positiva e finita." });
    }
  });
}

test("proteção verifica intensidade também em pulso criado fora de uma arma", () => {
  const pulso = { afinidade: "geada", origem: "Fonte externa", intensidade: Number.NaN };
  assert.throws(() => new ProtecaoDeGeada().ensaiar(pulso), { message: "Intensidade deve ser positiva e finita." });
});

test("pulso é um valor independente que preserva intensidade fracionária válida", () => {
  const arma = new ArmaDeGeada();
  const primeiro = arma.emitirPulso(0.5);
  const segundo = arma.emitirPulso(2);
  assert.equal(primeiro.intensidade, 0.5);
  assert.equal(segundo.intensidade, 2);
  assert.notEqual(primeiro, segundo);
  assert.equal(Object.isFrozen(primeiro), true);
});
