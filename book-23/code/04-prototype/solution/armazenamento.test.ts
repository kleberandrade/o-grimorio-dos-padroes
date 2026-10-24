import assert from "node:assert/strict";
import { test } from "node:test";
import { SeloDeProcedencia } from "../src/selo.js";
import { PocaoComArmazenamento } from "./pocao-com-armazenamento.js";

function criarOriginal(): PocaoComArmazenamento {
  return new PocaoComArmazenamento("L-01", [
    { nome: "Musgo", dose: { quantidade: 2, unidade: "gramas" }, observacoes: [] },
  ], new SeloDeProcedencia("NARA-07", "Lumeria"), { limiteGraus: 20, etiquetas: ["Abrigo da luz"] });
}

test("clone preserva subtipo e copia componente mutável sem compartilhar etiquetas", () => {
  const original = criarOriginal();
  const clone = original.clone("L-02");
  assert.ok(clone instanceof PocaoComArmazenamento);
  clone.definirLimite(15);
  clone.adicionarEtiqueta("Clone");
  original.adicionarEtiqueta("Original");
  original.ajustarQuantidade("Musgo", 8);
  assert.deepEqual(original.consultarArmazenamento(), { limiteGraus: 20, etiquetas: ["Abrigo da luz", "Original"] });
  assert.deepEqual(clone.consultarArmazenamento(), { limiteGraus: 15, etiquetas: ["Abrigo da luz", "Clone"] });
  assert.equal(clone.consultarIngredientes()[0]?.dose.quantidade, 2);
  assert.equal(clone.selo, original.selo);
});

test("entrada e consulta do componente também são copiadas", () => {
  const entrada = { limiteGraus: 20, etiquetas: ["Abrigo da luz"] };
  const pocao = new PocaoComArmazenamento("L-01", [
    { nome: "Musgo", dose: { quantidade: 2, unidade: "gramas" }, observacoes: [] },
  ], new SeloDeProcedencia("NARA-07", "Lumeria"), entrada);
  entrada.limiteGraus = 90;
  entrada.etiquetas.pop();
  const consulta = pocao.consultarArmazenamento();
  consulta.etiquetas.pop();
  assert.deepEqual(pocao.consultarArmazenamento(), { limiteGraus: 20, etiquetas: ["Abrigo da luz"] });
});

test("componente e clone mantêm validação de entrada e identidade", () => {
  const pocao = criarOriginal();
  assert.throws(() => pocao.definirLimite(Number.NaN), { message: "Limite de armazenamento deve ser finito." });
  assert.throws(() => pocao.clone("L-01"), { message: "Clone exige lote diferente do original." });
  assert.equal(pocao.consultarArmazenamento().limiteGraus, 20);
});
