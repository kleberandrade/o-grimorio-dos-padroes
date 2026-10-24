import assert from "node:assert/strict";
import { test } from "node:test";
import { PersonagemBuilder, RelatorioBuilder } from "../src/builders.js";
import { DiretorDeResgate } from "../src/diretor.js";
import { criarGaleriaComFiltroDireta, prepararGaleriaComFiltro } from "./protecao-especial.js";

test("nova receita adiciona proteção especial sem mudar o contrato de etapas", () => {
  const builder = new PersonagemBuilder();
  prepararGaleriaComFiltro(builder, "Bia");
  const ficha = builder.build();
  assert.deepEqual(ficha, criarGaleriaComFiltroDireta("Bia"));
  assert.ok(ficha.equipamentos.some((item) => item.protecoes.includes("agua")));
  assert.ok(ficha.equipamentos.some((item) => item.protecoes.includes("fumaca")));
});

test("a mesma extensão produz relatório e não altera a receita original", () => {
  const builder = new RelatorioBuilder();
  prepararGaleriaComFiltro(builder, "Bia");
  assert.equal(builder.build(), "Bia | resgatista | vida 100 | missão galeria | Manto impermeável, Lanterna, Máscara com filtro");
  new DiretorDeResgate().prepararGaleria(builder, "Bia");
  assert.equal(builder.build(), "Bia | resgatista | vida 100 | missão galeria | Manto impermeável, Lanterna");
});
