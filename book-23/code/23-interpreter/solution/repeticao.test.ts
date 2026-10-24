import assert from "node:assert/strict";
import { test } from "node:test";
import { ContextoArcano, RunaFogo } from "../src/expressoes.js";
import { ErroPrograma } from "../src/limites.js";
import { conjurarRepeticoes } from "./conjurar.js";
import { analisarRepeticoes } from "./parser-ampliado.js";
import { Repeticao } from "./repeticao.js";

const diagnostico = (codigo: string, posicao: number) => (erro: unknown) => erro instanceof ErroPrograma && erro.codigo === codigo && erro.posicao === posicao;

test("repetição de terminal/grupo compõe em ordem e contagem um preserva sequência", () => {
  assert.deepEqual(conjurarRepeticoes("(FI)*2L", new ContextoArcano()), {
    calor: 2, frio: 2, luz: 1, sequencia: ["F", "I", "F", "I", "L"],
  });
  assert.deepEqual(conjurarRepeticoes(" F * 1 I L ", new ContextoArcano()).sequencia, ["F", "I", "L"]);
  assert.equal(conjurarRepeticoes("F*9", new ContextoArcano()).calor, 9);
});

test("contagem zero/multidígito/ausente e sufixo duplo são recusados sem prefixo executado", () => {
  for (const [texto, codigo, posicao] of [["F*0", "REPETICAO", 2], ["F*10", "REPETICAO", 3],
    ["F*", "REPETICAO", 2], ["F**2", "REPETICAO", 2], ["F*2*2", "SIMBOLO", 3], ["F*9X", "SIMBOLO", 3]] as const) {
    const contexto = new ContextoArcano();
    assert.throws(() => conjurarRepeticoes(texto, contexto), diagnostico(codigo, posicao));
    assert.equal(contexto.snapshot().sequencia.length, 0);
  }
  for (const vezes of [0, -1, 10, 0.5, Infinity]) assert.throws(() => new Repeticao(new RunaFogo(), vezes));
});

test("custo de repetição é multiplicado sem expandir AST; orçamento recusa antes de qualquer efeito", () => {
  assert.equal(analisarRepeticoes("((F*9)*9)").operacoes(), 81);
  let profundo = "F";
  for (let nivel = 0; nivel < 8; nivel += 1) profundo = `(${profundo})*9`;
  assert.equal(analisarRepeticoes(profundo).operacoes(), 9 ** 8);
  for (const texto of ["L((F*9)*9)", profundo]) {
    const contexto = new ContextoArcano();
    assert.throws(() => conjurarRepeticoes(texto, contexto), diagnostico("ORCAMENTO", 0));
    assert.equal(contexto.snapshot().sequencia.length, 0);
  }
});

test("fronteira64 é aceita;65 é recusado com estado anterior intacto", () => {
  const contexto = new ContextoArcano();
  conjurarRepeticoes("(FFFFFFFF)*8", contexto);
  assert.equal(contexto.snapshot().sequencia.length, 64);
  const antes = contexto.snapshot();
  assert.throws(() => conjurarRepeticoes("(FFFFFFFF)*8F", contexto), diagnostico("ORCAMENTO", 0));
  assert.deepEqual(contexto.snapshot(), antes);
});

test("parser ampliado conserva regras de tamanho/grupos/vazio e valida toda entrada", () => {
  for (const [texto, codigo, posicao] of [["", "VAZIO", 0], ["(F", "ABERTURA", 2], ["F)", "FECHAMENTO", 1],
    ["()", "VAZIO", 1], ["F".repeat(257), "TAMANHO", 256], ["(".repeat(9) + "F" + ")".repeat(9), "PROFUNDIDADE", 8]] as const) {
    const contexto = new ContextoArcano();
    assert.throws(() => conjurarRepeticoes(texto, contexto), diagnostico(codigo, posicao));
    assert.equal(contexto.snapshot().sequencia.length, 0);
  }
});
