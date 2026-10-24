import assert from "node:assert/strict";
import { test } from "node:test";
import { PersonagemBuilder, RelatorioBuilder } from "../src/builders.js";
import type { Equipamento } from "../src/contratos.js";
import { DiretorDeResgate } from "../src/diretor.js";
import { criarFichaDireta } from "../src/direto.js";

const diretor = new DiretorDeResgate();
function prepararSemProtecao(): PersonagemBuilder {
  return new PersonagemBuilder().definirIdentidade("Ivo", "resgatista")
    .definirVida(100).definirMissao("torre");
}

test("receita torre entrega ficha completa com proteção exigida", () => {
  const builder = new PersonagemBuilder();
  diretor.prepararTorre(builder, "Ivo");
  assert.deepEqual(builder.build(), {
    nome: "Ivo", classe: "resgatista", vida: 100, missao: "torre",
    equipamentos: [{ nome: "Capa contra vento", protecoes: ["vento"] }, { nome: "Corda", protecoes: [] }],
  });
});

test("a mesma receita produz relatório em outra representação", () => {
  const builder = new RelatorioBuilder();
  diretor.prepararTorre(builder, "Ivo");
  assert.equal(builder.build(), "Ivo | resgatista | vida 100 | missão torre | Capa contra vento, Corda");
});

test("reutilizar a receita galeria limpa etapas e não altera a ficha anterior", () => {
  const builder = new PersonagemBuilder();
  diretor.prepararTorre(builder, "Ivo");
  const torre = builder.build();
  diretor.prepararGaleria(builder, "Bia");
  const galeria = builder.build();
  assert.equal(torre.nome, "Ivo");
  assert.equal(torre.missao, "torre");
  assert.deepEqual(torre.equipamentos.map((item) => item.nome), ["Capa contra vento", "Corda"]);
  assert.equal(galeria.nome, "Bia");
  assert.equal(galeria.missao, "galeria");
  assert.deepEqual(galeria.equipamentos.map((item) => item.nome), ["Manto impermeável", "Lanterna"]);
});

test("receita galeria também usa o relatório sem alterar a sequência", () => {
  const builder = new RelatorioBuilder();
  diretor.prepararGaleria(builder, "Bia");
  assert.equal(builder.build(), "Bia | resgatista | vida 100 | missão galeria | Manto impermeável, Lanterna");
});

test("montagem manual funciona sem Director e normaliza identidade", () => {
  const ficha = new PersonagemBuilder().definirIdentidade(" Ivo ", " resgatista ")
    .definirVida(100).definirMissao("torre")
    .adicionarEquipamento({ nome: " Capa ", protecoes: ["vento"] }).build();
  assert.equal(ficha.nome, "Ivo");
  assert.equal(ficha.classe, "resgatista");
  assert.equal(ficha.equipamentos[0]?.nome, "Capa");
});

test("identidade ausente impede build", () => {
  assert.throws(() => new PersonagemBuilder().build(), { message: "Nome obrigatório." });
});

test("classe vazia impede build", () => {
  assert.throws(() => prepararSemProtecao().definirIdentidade("Ivo", " ").build(), { message: "Classe obrigatória." });
});

for (const vida of [undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
  test(`vida ${vida} impede entrega`, () => {
    const builder = new PersonagemBuilder().definirIdentidade("Ivo", "resgatista");
    if (vida !== undefined) builder.definirVida(vida);
    assert.throws(() => builder.build(), { message: "Vida deve ser positiva e finita." });
  });
}

test("missão ausente impede entrega", () => {
  const builder = new PersonagemBuilder().definirIdentidade("Ivo", "resgatista").definirVida(100);
  assert.throws(() => builder.build(), { message: "Missão obrigatória." });
});

test("proteção ausente impede entrega e pode ser corrigida no mesmo rascunho", () => {
  const builder = prepararSemProtecao();
  assert.throws(() => builder.build(), { message: "Proteção obrigatória para torre: vento." });
  assert.equal(builder.adicionarEquipamento({ nome: "Capa", protecoes: ["vento"] }).build().nome, "Ivo");
});

test("proteção de torre não satisfaz missão galeria", () => {
  const builder = prepararSemProtecao().definirMissao("galeria")
    .adicionarEquipamento({ nome: "Capa", protecoes: ["vento"] });
  assert.throws(() => builder.build(), { message: "Proteção obrigatória para galeria: agua." });
});

test("equipamento sem nome é rejeitado mesmo declarando a proteção", () => {
  const builder = prepararSemProtecao().adicionarEquipamento({ nome: " ", protecoes: ["vento"] });
  assert.throws(() => builder.build(), { message: "Nome do equipamento obrigatório." });
});

test("entrada mutável é copiada antes do build, incluindo a lista aninhada", () => {
  const entrada = { nome: "Capa", protecoes: ["vento"] };
  const builder = prepararSemProtecao().adicionarEquipamento(entrada);
  entrada.nome = "Item alterado";
  entrada.protecoes.splice(0, 1, "agua");
  assert.deepEqual(builder.build().equipamentos, [{ nome: "Capa", protecoes: ["vento"] }]);
});

test("build mantém rascunho, mas devolve snapshots independentes", () => {
  const builder = prepararSemProtecao().adicionarEquipamento({ nome: "Capa", protecoes: ["vento"] });
  const primeiro = builder.build();
  const segundo = builder.build();
  assert.deepEqual(primeiro, segundo);
  assert.notEqual(primeiro, segundo);
  assert.notEqual(primeiro.equipamentos, segundo.equipamentos);
  assert.notEqual(primeiro.equipamentos[0], segundo.equipamentos[0]);
  assert.notEqual(primeiro.equipamentos[0]?.protecoes, segundo.equipamentos[0]?.protecoes);
  builder.definirIdentidade("Outra pessoa", "resgatista").adicionarEquipamento({ nome: "Corda", protecoes: [] });
  assert.equal(primeiro.nome, "Ivo");
  assert.equal(primeiro.equipamentos.length, 1);
});

test("ficha e níveis aninhados bloqueiam mutação em execução", () => {
  const ficha = prepararSemProtecao().adicionarEquipamento({ nome: "Capa", protecoes: ["vento"] }).build();
  assert.equal(Reflect.set(ficha, "nome", "Alterado"), false);
  const equipamento = ficha.equipamentos[0];
  assert.ok(equipamento);
  assert.equal(Reflect.set(equipamento, "nome", "Alterado"), false);
  assert.throws(() => (ficha.equipamentos as Equipamento[]).pop(), TypeError);
  assert.throws(() => (equipamento.protecoes as string[]).pop(), TypeError);
});

test("reiniciar explícito remove os obrigatórios do rascunho", () => {
  const builder = prepararSemProtecao().adicionarEquipamento({ nome: "Capa", protecoes: ["vento"] });
  const ficha = builder.build();
  assert.throws(() => builder.reiniciar().build(), { message: "Nome obrigatório." });
  assert.equal(ficha.nome, "Ivo");
});

test("relatório rejeita rascunho incompleto, sem texto que pareça pronto", () => {
  assert.throws(() => new RelatorioBuilder().build(), { message: "Nome obrigatório." });
});

test("objeto de opções direto produz a mesma ficha validada sem Builder", () => {
  const builder = new PersonagemBuilder();
  diretor.prepararTorre(builder, "Ivo");
  assert.deepEqual(criarFichaDireta({
    nome: "Ivo", classe: "resgatista", vida: 100, missao: "torre",
    equipamentos: [{ nome: "Capa contra vento", protecoes: ["vento"] }, { nome: "Corda", protecoes: [] }],
  }), builder.build());
});
