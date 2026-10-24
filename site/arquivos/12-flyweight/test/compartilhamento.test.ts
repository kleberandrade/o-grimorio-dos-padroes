import assert from "node:assert/strict";
import { test } from "node:test";
import { Aparicao, EssenciaEspirito, GuildaDosEspiritos } from "../src/espiritos.js";

test("fábrica compartilha a mesma identidade por tipo e distingue tipos", () => {
  const guilda = new GuildaDosEspiritos();
  assert.equal(guilda.obter("fogo"), guilda.obter("fogo"));
  assert.notEqual(guilda.obter("fogo"), guilda.obter("gelo"));
  assert.equal(guilda.quantidadeEssencias(), 2);
  assert.equal(guilda.obter("vento").cor, "branco");
});

test("essência é realmente imutável e seu estado não inclui posição", () => {
  const essencia = new EssenciaEspirito("fogo");
  assert.equal(Object.isFrozen(essencia), true);
  assert.equal(Reflect.set(essencia, "cor", "outra"), false);
  assert.equal(Reflect.set(essencia, "tipo", "vento"), false);
  assert.deepEqual(Object.keys(essencia), ["tipo", "cor"]);
});

test("mover uma aparição não move outra com a mesma essência", () => {
  const essencia = new EssenciaEspirito("fogo");
  const primeira = new Aparicao(essencia, { x: 12, y: 56 });
  const segunda = new Aparicao(essencia, { x: 73, y: 20 });
  primeira.moverPara({ x: 13, y: 57 });
  assert.equal(primeira.essencia, segunda.essencia);
  assert.deepEqual(primeira.descrever(), { tipo: "fogo", cor: "vermelho", x: 13, y: 57 });
  assert.deepEqual(segunda.descrever(), { tipo: "fogo", cor: "vermelho", x: 73, y: 20 });
});

test("posições de entrada e de movimento não deixam alias mutável", () => {
  const entrada = { x: 1, y: 2 };
  const aparicao = new Aparicao(new EssenciaEspirito("gelo"), entrada);
  entrada.x = 90;
  assert.equal(aparicao.descrever().x, 1);
  const movimento = { x: 3, y: 4 };
  aparicao.moverPara(movimento);
  movimento.x = 99;
  assert.equal(aparicao.descrever().x, 3);
  assert.equal(Reflect.set(aparicao.descrever(), "x", 100), false);
});

for (const tipo of ["constructor", "__proto__", "toString", "sombra"]) {
  test(`tipo ${tipo} é recusado sem alterar a tabela`, () => {
    const guilda = new GuildaDosEspiritos();
    assert.throws(() => guilda.obter(tipo), { message: `Tipo de espírito não suportado: ${tipo}.` });
    assert.equal(guilda.quantidadeEssencias(), 0);
    assert.equal(guilda.obter("fogo").tipo, "fogo");
  });
}

test("coordenada inválida falha antes de substituir posição válida", () => {
  const aparicao = new Aparicao(new EssenciaEspirito("vento"), { x: 1, y: 2 });
  assert.throws(() => aparicao.moverPara({ x: Number.NaN, y: 2 }), { message: "Coordenadas devem ser finitas." });
  assert.deepEqual(aparicao.descrever(), { tipo: "vento", cor: "branco", x: 1, y: 2 });
  assert.throws(() => new Aparicao(new EssenciaEspirito("vento"), { x: 1, y: Number.POSITIVE_INFINITY }), { message: "Coordenadas devem ser finitas." });
});

test("não aceita essência mutável estruturalmente compatível", () => {
  const mutavel = { tipo: "fogo" as const, cor: "vermelho", descrever: () => ({ tipo: "fogo" as const, cor: "vermelho", x: 0, y: 0 }) };
  assert.throws(() => new Aparicao(mutavel, { x: 0, y: 0 }), { message: "Essência compartilhada deve estar congelada." });
});
