import assert from "node:assert/strict";
import { test } from "node:test";
import { construirCenario, conferirCenario } from "../experiment/cenario.js";

test("os modelos comparados preservam os mesmos dados e divergem só no compartilhamento", () => {
  const parametros = { contagem: 12, tipos: ["fogo", "gelo", "vento"] as const };
  const independente = conferirCenario(construirCenario("sem-compartilhar", parametros));
  const compartilhado = conferirCenario(construirCenario("flyweight", parametros));
  assert.equal(independente.dadosSha256, compartilhado.dadosSha256);
  assert.equal(independente.contagem, compartilhado.contagem);
  assert.equal(independente.essenciasUnicas, 12);
  assert.equal(compartilhado.essenciasUnicas, 3);
});

test("variar cardinalidade preserva posições e muda a quantidade de essências compartilhadas", () => {
  const primeiro = construirCenario("flyweight", { contagem: 6, tipos: ["fogo"] });
  const segundo = construirCenario("flyweight", { contagem: 6, tipos: ["fogo", "gelo", "vento"] });
  assert.equal(conferirCenario(primeiro).essenciasUnicas, 1);
  assert.equal(conferirCenario(segundo).essenciasUnicas, 3);
  assert.deepEqual(primeiro.aparicoes.map((item) => [item.descrever().x, item.descrever().y]), segundo.aparicoes.map((item) => [item.descrever().x, item.descrever().y]));
});
