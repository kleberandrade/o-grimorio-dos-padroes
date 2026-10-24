import assert from "node:assert/strict";
import { test } from "node:test";
import { personalizarLote } from "../src/cliente.js";
import type { Ingrediente } from "../src/contratos.js";
import { Pocao } from "../src/pocao.js";
import { SeloDeProcedencia } from "../src/selo.js";

function ingredientes(): Ingrediente[] {
  return [{ nome: "Musgo", dose: { quantidade: 2, unidade: "gramas" }, observacoes: ["Secar à sombra"] }];
}
function criarOriginal(): Pocao {
  return new Pocao("L-01", ingredientes(), new SeloDeProcedencia("NARA-07", "Lumeria"));
}

test("clone preserva dados e comportamento com outra identidade de objeto e lote", () => {
  const original = criarOriginal();
  const clone = original.clone("L-02");
  assert.notEqual(clone, original);
  assert.equal(clone.lote, "L-02");
  assert.deepEqual(clone.consultarIngredientes(), original.consultarIngredientes());
  assert.ok(clone instanceof Pocao);
  assert.equal(clone.descrever(), "L-02 | Musgo: 2 gramas | selo NARA-07");
});

test("personalizar o clone via cliente não reconstrói a fórmula nem modifica o original", () => {
  const original = criarOriginal();
  const variante = personalizarLote(original, "L-02", "Musgo", 3);
  assert.equal(variante.consultarIngredientes()[0]?.dose.quantidade, 3);
  assert.equal(original.consultarIngredientes()[0]?.dose.quantidade, 2);
});

test("mudar observações e adicionar ingredientes no clone não altera o original", () => {
  const original = criarOriginal();
  const clone = original.clone("L-02");
  clone.anotarIngrediente("Musgo", "Ensaiar solo alagado");
  clone.adicionarIngrediente({ nome: "Junco", dose: { quantidade: 4, unidade: "gotas" }, observacoes: [] });
  assert.equal(clone.consultarIngredientes().length, 2);
  assert.deepEqual(original.consultarIngredientes(), ingredientes());
});

test("alterar o original após clone não contamina dose, notas nem lista da cópia", () => {
  const original = criarOriginal();
  const clone = original.clone("L-02");
  original.ajustarQuantidade("Musgo", 5);
  original.anotarIngrediente("Musgo", "Nova nota");
  original.adicionarIngrediente({ nome: "Junco", dose: { quantidade: 4, unidade: "gotas" }, observacoes: [] });
  assert.deepEqual(clone.consultarIngredientes(), ingredientes());
});

test("construtor copia lista de entrada, objetos, dose e lista de observações", () => {
  const entrada = ingredientes();
  const original = new Pocao("L-01", entrada, new SeloDeProcedencia("NARA-07", "Lumeria"));
  const item = entrada[0];
  assert.ok(item);
  item.nome = "Outro";
  item.dose.quantidade = 90;
  item.observacoes.push("Alteração externa");
  entrada.pop();
  assert.deepEqual(original.consultarIngredientes(), ingredientes());
});

test("adicionar ingrediente copia também entradas recebidas após a construção", () => {
  const original = criarOriginal();
  const entrada: Ingrediente = { nome: "Junco", dose: { quantidade: 4, unidade: "gotas" }, observacoes: [] };
  original.adicionarIngrediente(entrada);
  entrada.dose.quantidade = 20;
  entrada.observacoes.push("Mudou");
  assert.deepEqual(original.consultarIngredientes()[1], { nome: "Junco", dose: { quantidade: 4, unidade: "gotas" }, observacoes: [] });
});

test("consulta devolve cópia defensiva em todos os níveis mutáveis", () => {
  const original = criarOriginal();
  const consulta = original.consultarIngredientes();
  const item = consulta[0];
  assert.ok(item);
  item.dose.quantidade = 90;
  item.observacoes.pop();
  consulta.pop();
  assert.deepEqual(original.consultarIngredientes(), ingredientes());
});

test("selo é a mesma referência imutável por decisão explícita do contrato", () => {
  const original = criarOriginal();
  const clone = original.clone("L-02");
  assert.equal(clone.selo, original.selo);
  assert.equal(Object.isFrozen(clone.selo), true);
  assert.equal(Reflect.set(clone.selo, "origem", "Outro lugar"), false);
  assert.equal(original.selo.origem, "Lumeria");
});

test("um selo estruturalmente válido, mas mutável, é recusado antes de compartilhar", () => {
  const seloMutavel = { codigo: "NARA-07", origem: "Lumeria" };
  assert.throws(() => new Pocao("L-01", ingredientes(), seloMutavel), {
    message: "Selo compartilhado deve estar congelado.",
  });
});

for (const lote of ["", "  ", " L-01 "]) {
  test(`clone rejeita lote inválido ${JSON.stringify(lote)}`, () => {
    assert.throws(() => criarOriginal().clone(lote), {
      message: lote.trim() ? "Clone exige lote diferente do original." : "Campo obrigatório: Lote.",
    });
  });
}

for (const quantidade of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
  test(`quantidade ${quantidade} é rejeitada sem alterar fórmula`, () => {
    const original = criarOriginal();
    assert.throws(() => original.ajustarQuantidade("Musgo", quantidade), { message: "Quantidade deve ser positiva e finita." });
    assert.deepEqual(original.consultarIngredientes(), ingredientes());
  });
}

test("ingrediente desconhecido e nome duplicado são diagnosticados", () => {
  const original = criarOriginal();
  assert.throws(() => original.ajustarQuantidade("Ausente", 2), { message: "Ingrediente desconhecido: Ausente." });
  const item = ingredientes()[0];
  assert.ok(item);
  assert.throws(() => original.adicionarIngrediente(item), { message: "Ingrediente duplicado: Musgo." });
});

test("fórmula vazia e nota vazia não são aceitas", () => {
  assert.throws(() => new Pocao("L-01", [], new SeloDeProcedencia("NARA-07", "Lumeria")), { message: "Ao menos um ingrediente obrigatório." });
  assert.throws(() => criarOriginal().anotarIngrediente("Musgo", " "), { message: "Campo obrigatório: Observação." });
});

test("construção direta é alternativa real quando todos os valores são conhecidos", () => {
  const selo = new SeloDeProcedencia("NARA-07", "Lumeria");
  const original = new Pocao("L-01", ingredientes(), selo);
  const variante = personalizarLote(original, "L-02", "Musgo", 3);
  const direta = new Pocao("L-02", [{ nome: "Musgo", dose: { quantidade: 3, unidade: "gramas" }, observacoes: ["Secar à sombra"] }], selo);
  assert.deepEqual(direta.consultarIngredientes(), variante.consultarIngredientes());
  assert.equal(direta.descrever(), variante.descrever());
});

test("structuredClone dos dados funciona; da instância não mantém métodos nem estado privado", () => {
  const original = criarOriginal();
  assert.deepEqual(structuredClone(original.consultarIngredientes()), ingredientes());
  const copia: unknown = structuredClone(original);
  assert.equal(copia instanceof Pocao, false);
  assert.deepEqual(copia, {});
});
