import assert from "node:assert/strict";
import { test } from "node:test";
import { Formacao, Soldado } from "../src/arvore.js";
import type { NoDaArvore } from "../src/arvore.js";
import type { EventoOrdem, Unidade } from "../src/contratos.js";
import { executarListaPlana } from "../src/direto.js";

test("folha isolada atende Unidade e não oferece gestão de filhos", () => {
  const soldado = new Soldado(" Alaric ");
  const unidade: Unidade = soldado;
  assert.deepEqual(unidade.executarOrdem(" recuar "), [{ tipo: "soldado", nome: "Alaric", ordem: "recuar" }]);
  assert.equal("adicionar" in soldado, false);
  assert.equal("listarMembros" in soldado, false);
});

test("dois níveis registram cada formação antes das folhas na ordem de inserção", () => {
  const pelotao = new Formacao("Pelotão do Norte");
  pelotao.adicionar(new Soldado("Alaric"));
  pelotao.adicionar(new Soldado("Elora"));
  const raiz = new Formacao("Formação de Mirralis");
  raiz.adicionar(pelotao);
  raiz.adicionar(new Soldado("Lorn"));
  assert.deepEqual(raiz.executarOrdem("recuar"), [
    { tipo: "formacao", nome: "Formação de Mirralis", ordem: "recuar" },
    { tipo: "formacao", nome: "Pelotão do Norte", ordem: "recuar" },
    { tipo: "soldado", nome: "Alaric", ordem: "recuar" },
    { tipo: "soldado", nome: "Elora", ordem: "recuar" },
    { tipo: "soldado", nome: "Lorn", ordem: "recuar" },
  ]);
});

test("formação vazia ainda registra sua própria entrada", () => {
  assert.deepEqual(new Formacao("Reserva").executarOrdem("aguardar"), [{ tipo: "formacao", nome: "Reserva", ordem: "aguardar" }]);
});

test("auto inclusão é rejeitada sem alterar a lista", () => {
  const raiz = new Formacao("Raiz");
  assert.throws(() => raiz.adicionar(raiz), { message: "Formação não pode conter a si mesma." });
  assert.deepEqual(raiz.listarMembros(), []);
});

test("ligar descendente ao ancestral é rejeitado mesmo a três níveis", () => {
  const raiz = new Formacao("Raiz");
  const ramo = new Formacao("Ramo");
  const fundo = new Formacao("Fundo");
  raiz.adicionar(ramo);
  ramo.adicionar(fundo);
  assert.throws(() => fundo.adicionar(raiz), { message: "Inclusão criaria ciclo com ancestral." });
  assert.deepEqual(fundo.listarMembros(), []);
  assert.deepEqual(raiz.executarOrdem("recuar").map((item) => item.nome), ["Raiz", "Ramo", "Fundo"]);
});

test("a mesma identidade não pode aparecer duas vezes no grupo", () => {
  const raiz = new Formacao("Raiz");
  const soldado = new Soldado("Alaric");
  raiz.adicionar(soldado);
  assert.throws(() => raiz.adicionar(soldado), { message: "Unidade já pertence a esta formação." });
  assert.equal(raiz.executarOrdem("recuar").length, 2);
});

test("um nó não pode pertencer a dois grupos, mesmo em árvores distintas", () => {
  const primeira = new Formacao("Primeira");
  const segunda = new Formacao("Segunda");
  const soldado = new Soldado("Alaric");
  primeira.adicionar(soldado);
  assert.throws(() => segunda.adicionar(soldado), { message: "Unidade já pertence a outra formação." });
  assert.deepEqual(segunda.listarMembros(), []);
});

test("objetos diferentes com o mesmo nome continuam sendo identidades distintas", () => {
  const grupo = new Formacao("Raiz");
  grupo.adicionar(new Soldado("Homônimo"));
  grupo.adicionar(new Soldado("Homônimo"));
  assert.equal(grupo.executarOrdem("recuar").length, 3);
});

test("listar membros devolve cópia do array sem liberar vínculos internos", () => {
  const raiz = new Formacao("Raiz");
  const outra = new Formacao("Outra");
  const soldado = new Soldado("Alaric");
  raiz.adicionar(soldado);
  const membros = raiz.listarMembros() as NoDaArvore[];
  membros.pop();
  assert.equal(raiz.listarMembros().length, 1);
  assert.throws(() => outra.adicionar(soldado), { message: "Unidade já pertence a outra formação." });
});

test("relatórios são valores congelados, independentes entre execuções", () => {
  const raiz = new Formacao("Raiz");
  raiz.adicionar(new Soldado("Alaric"));
  const primeiro = raiz.executarOrdem("recuar");
  const segundo = raiz.executarOrdem("aguardar");
  assert.notEqual(primeiro, segundo);
  assert.equal(primeiro[0]?.ordem, "recuar");
  assert.equal(segundo[0]?.ordem, "aguardar");
  assert.throws(() => (primeiro as EventoOrdem[]).pop(), TypeError);
  const evento = primeiro[0];
  assert.ok(evento);
  assert.equal(Reflect.set(evento, "nome", "Alterado"), false);
});

test("nomes e ordens vazios são recusados", () => {
  assert.throws(() => new Soldado(" "), { message: "Campo obrigatório: nome." });
  assert.throws(() => new Formacao(" "), { message: "Campo obrigatório: nome." });
  assert.throws(() => new Soldado("Alaric").executarOrdem(" "), { message: "Campo obrigatório: ordem." });
  assert.throws(() => new Formacao("Raiz").executarOrdem(" "), { message: "Campo obrigatório: ordem." });
});

test("lista plana atende unidades independentes sem inventar um grupo", () => {
  assert.deepEqual(executarListaPlana([new Soldado("Alaric"), new Soldado("Elora")], "recuar"), [
    { tipo: "soldado", nome: "Alaric", ordem: "recuar" }, { tipo: "soldado", nome: "Elora", ordem: "recuar" },
  ]);
});
