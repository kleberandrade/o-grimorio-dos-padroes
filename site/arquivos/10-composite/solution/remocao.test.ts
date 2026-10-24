import assert from "node:assert/strict";
import { test } from "node:test";
import { Formacao, Soldado } from "../src/arvore.js";
import { FormacaoEditavel } from "./formacao-editavel.js";

test("remover subárvore presente preserva descendentes e permite incluir em outra formação", () => {
  const origem = new FormacaoEditavel("Origem");
  const destino = new Formacao("Destino");
  const pelotao = new Formacao("Pelotão");
  const soldado = new Soldado("Alaric");
  pelotao.adicionar(soldado);
  origem.adicionar(pelotao);
  origem.adicionar(new Soldado("Elora"));
  assert.equal(origem.remover(pelotao), true);
  assert.equal(origem.remover(pelotao), false);
  destino.adicionar(pelotao);
  assert.deepEqual(origem.executarOrdem("recuar").map((item) => item.nome), ["Origem", "Elora"]);
  assert.deepEqual(destino.executarOrdem("recuar").map((item) => item.nome), ["Destino", "Pelotão", "Alaric"]);
  assert.throws(() => origem.adicionar(soldado), { message: "Unidade já pertence a outra formação." });
});

test("remoção ausente não libera membro de outra formação nem muda ordens", () => {
  const certa = new FormacaoEditavel("Certa");
  const errada = new FormacaoEditavel("Errada");
  const soldado = new Soldado("Alaric");
  certa.adicionar(soldado);
  assert.equal(errada.remover(soldado), false);
  assert.throws(() => errada.adicionar(soldado), { message: "Unidade já pertence a outra formação." });
  assert.deepEqual(certa.executarOrdem("recuar").map((item) => item.nome), ["Certa", "Alaric"]);
});

test("retirada e nova inclusão mantêm a política de ciclos e a ordem dos irmãos restantes", () => {
  const raiz = new FormacaoEditavel("Raiz");
  const ramo = new Formacao("Ramo");
  const a = new Soldado("A");
  const b = new Soldado("B");
  raiz.adicionar(a);
  raiz.adicionar(ramo);
  raiz.adicionar(b);
  assert.equal(raiz.remover(a), true);
  assert.deepEqual(raiz.executarOrdem("recuar").map((item) => item.nome), ["Raiz", "Ramo", "B"]);
  assert.throws(() => ramo.adicionar(raiz), { message: "Inclusão criaria ciclo com ancestral." });
  raiz.remover(ramo);
  ramo.adicionar(raiz);
  assert.throws(() => raiz.adicionar(ramo), { message: "Inclusão criaria ciclo com ancestral." });
});
