import assert from "node:assert/strict";
import { test } from "node:test";
import { ContextoArcano, RunaFogo, RunaGelo, RunaLuz, Sequencia } from "../src/expressoes.js";
import type { Expressao, Contexto } from "../src/expressoes.js";
import { analisar } from "../src/parser.js";
import { conjurar, executar } from "../src/executar.js";
import { ErroPrograma } from "../src/limites.js";
import { aplicarComando } from "../src/simples.js";

function erroEsperado(codigo: ErroPrograma["codigo"], posicao: number) {
  return (erro: unknown) => erro instanceof ErroPrograma && erro.codigo === codigo && erro.posicao === posicao;
}

test("AST manual tem terminais e sequência composta com efeitos observáveis em ordem", () => {
  const ast = new Sequencia([new RunaLuz(), new Sequencia([new RunaFogo(), new RunaGelo()]), new RunaLuz()]);
  const contexto = new ContextoArcano();
  assert.equal(ast.operacoes(), 4);
  executar(ast, contexto);
  assert.deepEqual(contexto.snapshot(), { calor: 1, frio: 1, luz: 2, sequencia: ["L", "F", "I", "L"] });
});

test("parser constrói AST completa sem contexto e gramática preserva esquerda para direita", () => {
  const ast = analisar(" L ( F\tI )\r\n L ");
  assert.equal(ast.operacoes(), 4);
  const contexto = new ContextoArcano(); executar(ast, contexto);
  assert.deepEqual(contexto.snapshot().sequencia, ["L", "F", "I", "L"]);
});

test("desconhecidos nunca são ignorados; posições são índices UTF16, sem execução de prefixo", () => {
  for (const [texto, posicao] of [["FXL", 1], ["F😀I", 1], ["F*2", 1], ["f", 0], ["\vF", 0], ["\fF", 0], ["\u00a0F", 0]] as const) {
    const contexto = new ContextoArcano();
    assert.throws(() => conjurar(texto, contexto), erroEsperado("SIMBOLO", posicao));
    assert.deepEqual(contexto.snapshot().sequencia, []);
  }
});

test("grupos malformados/vazios têm causa e posição definidas antes de efeitos", () => {
  for (const [texto, codigo, posicao] of [["F)", "FECHAMENTO", 1], ["(FI", "ABERTURA", 3],
    ["F(", "ABERTURA", 2], ["()", "VAZIO", 1], ["( )", "VAZIO", 2], ["", "VAZIO", 0], [" \t", "VAZIO", 2]] as const) {
    const contexto = new ContextoArcano();
    assert.throws(() => conjurar(texto, contexto), erroEsperado(codigo, posicao));
    assert.equal(contexto.snapshot().sequencia.length, 0);
  }
});

test("limites de tamanho e profundidade são verificados, incluindo suas fronteiras", () => {
  assert.equal(analisar(" ".repeat(255) + "F").operacoes(), 1);
  assert.throws(() => analisar(" ".repeat(256) + "F"), erroEsperado("TAMANHO", 256));
  assert.equal(analisar("(".repeat(8) + "F" + ")".repeat(8)).operacoes(), 1);
  assert.throws(() => analisar("(".repeat(9) + "F" + ")".repeat(9)), erroEsperado("PROFUNDIDADE", 8));
});

test("orçamento é pré-verificado; toda sintaxe precede a decisão global de orçamento", () => {
  const contexto = new ContextoArcano();
  conjurar("F".repeat(64), contexto);
  assert.equal(contexto.snapshot().calor, 64);
  const semEfeitos = new ContextoArcano();
  assert.throws(() => conjurar("F".repeat(65), semEfeitos), erroEsperado("ORCAMENTO", 0));
  assert.deepEqual(semEfeitos.snapshot().sequencia, []);
  assert.throws(() => conjurar("F".repeat(65) + "X", semEfeitos), erroEsperado("SIMBOLO", 65));
  assert.deepEqual(semEfeitos.snapshot().sequencia, []);
});

test("orçamento opcional só reduz teto e custo de extensão inválido não chama interpretar", () => {
  const contexto = new ContextoArcano();
  assert.throws(() => executar(analisar("FIL"), contexto, 2), erroEsperado("ORCAMENTO", 0));
  for (const limite of [0, -1, 0.5, NaN, Infinity, 65]) assert.throws(() => executar(analisar("F"), contexto, limite));
  let interpretacoes = 0;
  for (const custo of [0, -1, 0.5, NaN, Infinity]) {
    const externa: Expressao = { operacoes: () => custo, interpretar: () => { interpretacoes += 1; } };
    assert.throws(() => executar(externa, contexto), erroEsperado("ORCAMENTO", 0));
  }
  assert.equal(interpretacoes, 0);
  assert.equal(contexto.snapshot().sequencia.length, 0);
});

test("falha durante interpretação propaga e conserva efeitos anteriores sem executar restante", () => {
  const efeitos: string[] = [];
  const falha = new Error("Contexto interrompeu.");
  const contexto: Contexto = { registrar: (simbolo) => { efeitos.push(simbolo); if (simbolo === "I") throw falha; } };
  assert.throws(() => executar(analisar("FIL"), contexto), (erro: unknown) => erro === falha);
  assert.deepEqual(efeitos, ["F", "I"]);
});

test("sequência copia lista de filhos e snapshots/resultados não alteram contexto anterior", () => {
  const filhas: Expressao[] = [new RunaFogo()];
  const ast = new Sequencia(filhas); filhas.push(new RunaGelo());
  const contexto = new ContextoArcano(); executar(ast, contexto);
  const antes = contexto.snapshot();
  assert.equal(Reflect.set(antes, "calor", 100), false);
  assert.equal(Reflect.set(antes.sequencia, "0", "L"), false);
  executar(new RunaLuz(), contexto);
  assert.deepEqual(antes.sequencia, ["F"]);
  assert.deepEqual(contexto.snapshot().sequencia, ["F", "L"]);
  assert.throws(() => new Sequencia([]));
});

test("switch é alternativa executável para comando único sem gramática composta", () => {
  const contexto = new ContextoArcano();
  aplicarComando("F", contexto); aplicarComando("I", contexto); aplicarComando("L", contexto);
  assert.deepEqual(contexto.snapshot().sequencia, ["F", "I", "L"]);
});
