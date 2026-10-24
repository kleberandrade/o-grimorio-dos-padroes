import assert from "node:assert/strict";
import { test } from "node:test";
import { ArquivoEmLista, ArquivoEncadeado } from "../src/arquivos.js";
import { ArquivoIterable, gerarSnapshot } from "./iteravel.js";

function arquivoInicial() {
  const arquivo = new ArquivoEmLista();
  arquivo.adicionar({ id: 1, descricao: "A" }); arquivo.adicionar({ id: 2, descricao: "B" });
  return arquivo;
}

test("ponte acrescenta Iterable nativo no exercício, sem alegar que existe na coleção base", () => {
  for (const Tipo of [ArquivoEmLista, ArquivoEncadeado]) {
    const arquivo = new Tipo(); arquivo.adicionar({ id: 1, descricao: "A" });
    assert.equal(Symbol.iterator in arquivo, false);
    const iteravel = new ArquivoIterable(arquivo);
    const iterador = iteravel[Symbol.iterator]();
    assert.equal(iterador[Symbol.iterator](), iterador);
    assert.deepEqual(iterador.next(), { done: false, value: { id: 1, descricao: "A" } });
    assert.deepEqual(iterador.next(), { done: true, value: undefined });
    assert.deepEqual(iterador.next(), { done: true, value: undefined });
  }
});

test("ponte captura na chamada Symbol.iterator, antes do primeiro next; duas posições independentes", () => {
  const arquivo = arquivoInicial(); const iteravel = new ArquivoIterable(arquivo);
  const primeiro = iteravel[Symbol.iterator](); const segundo = iteravel[Symbol.iterator]();
  arquivo.adicionar({ id: 3, descricao: "C" }); arquivo.atualizar({ id: 1, descricao: "A nova" });
  assert.equal(primeiro.next().value?.id, 1);
  assert.equal(primeiro.next().value?.id, 2);
  assert.deepEqual([...segundo], [{ id: 1, descricao: "A" }, { id: 2, descricao: "B" }]);
  assert.equal(primeiro.next().done, true);
  assert.deepEqual([...iteravel].map((ordem) => ordem.id), [1, 2, 3]);
});

test("criar wrapper não captura: snapshot ocorre ao pedir o iterador", () => {
  const arquivo = new ArquivoEmLista();
  const iteravel = new ArquivoIterable(arquivo);
  arquivo.adicionar({ id: 1, descricao: "Depois do wrapper, antes do iterador" });
  assert.deepEqual([...iteravel].map((ordem) => ordem.id), [1]);
});

test("gerador captura fora do corpo preguiçoso, inclusive mutação antes do primeiro next", () => {
  const arquivo = arquivoInicial();
  let capturas = 0;
  const origem = { criarPercurso() { capturas += 1; return arquivo.criarPercurso(); } };
  const gerador = gerarSnapshot(origem);
  assert.equal(capturas, 1);
  arquivo.adicionar({ id: 3, descricao: "C" }); arquivo.atualizar({ id: 1, descricao: "A nova" });
  assert.deepEqual([...gerador], [{ id: 1, descricao: "A" }, { id: 2, descricao: "B" }]);
  assert.deepEqual(gerador.next(), { done: true, value: undefined });
  assert.deepEqual([...gerarSnapshot(arquivo)].map((ordem) => ordem.id), [1, 2, 3]);
});

test("break chama return da ponte e não reinicia instância; coleção produz outro percurso", () => {
  const iteravel = new ArquivoIterable(arquivoInicial());
  const iterador = iteravel[Symbol.iterator]();
  for (const ordem of iterador) { assert.equal(ordem.id, 1); break; }
  assert.deepEqual(iterador.next(), { done: true, value: undefined });
  assert.deepEqual([...iterador], []);
  assert.deepEqual([...iteravel].map((ordem) => ordem.id), [1, 2]);
  const outro = iteravel[Symbol.iterator]();
  assert.deepEqual(outro.return!(), { done: true, value: undefined });
  assert.equal(outro.next().done, true);
});

test("gerador fechado por break/return não reinicia; gerador vazio permanece esgotado", () => {
  const arquivo = arquivoInicial(); const gerador = gerarSnapshot(arquivo);
  for (const ordem of gerador) { assert.equal(ordem.id, 1); break; }
  assert.deepEqual([...gerador], []);
  assert.equal(gerador.next().done, true);
  const fechadoAntes = gerarSnapshot(arquivo);
  fechadoAntes.return(undefined);
  assert.equal(fechadoAntes.next().done, true);
  const vazio = gerarSnapshot(new ArquivoEmLista());
  assert.deepEqual(vazio.next(), { done: true, value: undefined });
  assert.deepEqual(vazio.next(), { done: true, value: undefined });
});
