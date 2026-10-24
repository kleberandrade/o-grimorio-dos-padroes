import assert from "node:assert/strict";
import { test } from "node:test";
import { ArquivoEmLista, ArquivoEncadeado } from "../src/arquivos.js";
import type { IteradorOrdens, Ordem } from "../src/contratos.js";
import { PercursoSnapshot } from "../src/percurso.js";
import { demonstrarNativo } from "../src/nativo.js";

function consumir(percurso: IteradorOrdens): Ordem[] {
  const resultado: Ordem[] = [];
  while (true) { const passo = percurso.proximo(); if (passo.fim) return resultado; resultado.push(passo.ordem); }
}

for (const Tipo of [ArquivoEmLista, ArquivoEncadeado]) {
  test(`${Tipo.name}: ordem de inserção é explícita, esgotamento e vazio permanecem fim`, () => {
    const arquivo = new Tipo();
    const vazio = arquivo.criarPercurso();
    assert.deepEqual(vazio.proximo(), { fim: true });
    assert.deepEqual(vazio.proximo(), { fim: true });
    arquivo.adicionar({ id: 2, descricao: "Segunda numeração, primeira inserção" });
    arquivo.adicionar({ id: 1, descricao: "Primeira numeração, segunda inserção" });
    assert.deepEqual(vazio.proximo(), { fim: true });
    const percurso = arquivo.criarPercurso();
    assert.deepEqual(consumir(percurso).map((ordem) => ordem.id), [2, 1]);
    assert.deepEqual(percurso.proximo(), { fim: true });
    assert.deepEqual(percurso.proximo(), { fim: true });
  });

  test(`${Tipo.name}: dois percursos externos têm posições independentes`, () => {
    const arquivo = new Tipo();
    arquivo.adicionar({ id: 1, descricao: "A" }); arquivo.adicionar({ id: 2, descricao: "B" });
    const primeiro = arquivo.criarPercurso(); const segundo = arquivo.criarPercurso();
    assert.deepEqual(consumir(primeiro).map((ordem) => ordem.id), [1, 2]);
    assert.deepEqual(consumir(segundo).map((ordem) => ordem.id), [1, 2]);
    assert.notEqual(primeiro, segundo);
  });

  test(`${Tipo.name}: snapshot captura antes do primeiro passo e atualização não reordena`, () => {
    const arquivo = new Tipo();
    arquivo.adicionar({ id: 2, descricao: "A" }); arquivo.adicionar({ id: 1, descricao: "B" });
    const antigo = arquivo.criarPercurso();
    arquivo.atualizar({ id: 2, descricao: "A nova" });
    arquivo.adicionar({ id: 3, descricao: "C" });
    assert.deepEqual(consumir(antigo), [{ id: 2, descricao: "A" }, { id: 1, descricao: "B" }]);
    assert.deepEqual(consumir(arquivo.criarPercurso()), [
      { id: 2, descricao: "A nova" }, { id: 1, descricao: "B" }, { id: 3, descricao: "C" },
    ]);
  });

  test(`${Tipo.name}: entradas e resultados não expõem dados mutáveis do arquivo`, () => {
    const arquivo = new Tipo();
    const entrada = { id: 1, descricao: " A " };
    arquivo.adicionar(entrada);
    entrada.id = 9; entrada.descricao = "Fora";
    const passo = arquivo.criarPercurso().proximo();
    assert.equal(passo.fim, false);
    if (passo.fim) assert.fail("Esperada ordem.");
    assert.deepEqual(passo.ordem, { id: 1, descricao: "A" });
    assert.equal(Reflect.set(passo, "fim", true), false);
    assert.equal(Reflect.set(passo.ordem, "descricao", "Tentativa"), false);
    const atualizacao = { id: 1, descricao: "Atualizada" };
    arquivo.atualizar(atualizacao); atualizacao.descricao = "Mutada fora";
    assert.deepEqual(consumir(arquivo.criarPercurso()), [{ id: 1, descricao: "Atualizada" }]);
    assert.equal(passo.ordem.descricao, "A");
  });

  test(`${Tipo.name}: id inválido/duplicado, descrição vazia e atualização ausente não mudam acervo`, () => {
    const arquivo = new Tipo(); arquivo.adicionar({ id: 1, descricao: "A" });
    for (const id of [0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => arquivo.adicionar({ id, descricao: "X" }));
    assert.throws(() => arquivo.adicionar({ id: 1, descricao: "Duplicada" }));
    assert.throws(() => arquivo.adicionar({ id: 2, descricao: " " }));
    assert.throws(() => arquivo.atualizar({ id: 9, descricao: "Ausente" }));
    assert.deepEqual(consumir(arquivo.criarPercurso()), [{ id: 1, descricao: "A" }]);
  });
}

test("construção direta de percurso também copia a lista recebida antes do consumo", () => {
  const entrada = [{ id: 1, descricao: "A" }];
  const percurso = new PercursoSnapshot(entrada);
  entrada[0]!.descricao = "Mutada";
  entrada.push({ id: 2, descricao: "B" });
  assert.deepEqual(consumir(percurso), [{ id: 1, descricao: "A" }]);
});

test("exemplo nativo executado distingue callbacks internos de protocolo Symbol.iterator", () => {
  assert.deepEqual(demonstrarNativo(), { porCallback: [1, 2, 3], dobrados: [2, 4, 6],
    porProtocolo: [1, 2, 3], aposCallbacks: 0, aposForOf: 1 });
});
