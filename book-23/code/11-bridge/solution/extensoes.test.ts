import assert from "node:assert/strict";
import { test } from "node:test";
import { Arco, Espada } from "../src/armas.js";
import { EssenciaFogo, EssenciaGelo } from "../src/essencias.js";
import { Escudo, EssenciaVento } from "./extensoes.js";

test("nova essência funciona com formas anteriores sem mudá-las", () => {
  const vento = new EssenciaVento();
  assert.deepEqual(new Espada(vento).empunhar({ nucleoMolhado: false }), {
    estado: "executado", forma: "espada", essencia: "vento", custo: 3, efeitos: ["corte", "impulso"],
  });
  assert.deepEqual(new Arco(vento).empunhar({ nucleoMolhado: false }), {
    estado: "executado", forma: "arco", essencia: "vento", custo: 4, efeitos: ["disparo", "impulso"],
  });
});

test("nova forma coopera com as duas essências anteriores e a nova", () => {
  const resultados = [new EssenciaFogo(), new EssenciaGelo(), new EssenciaVento()]
    .map((essencia) => new Escudo(essencia).empunhar({ nucleoMolhado: false }));
  assert.deepEqual(resultados.map((resultado) => [resultado.essencia, resultado.custo, resultado.efeitos]), [
    ["fogo", 5, ["aparar", "calor"]], ["gelo", 6, ["aparar", "frio"]], ["vento", 4, ["aparar", "impulso"]],
  ]);
});

test("a nova forma preserva restrição e troca de essência herdadas", () => {
  const escudo = new Escudo(new EssenciaFogo());
  assert.equal(escudo.empunhar({ nucleoMolhado: true }).estado, "bloqueado");
  const vento = new EssenciaVento();
  escudo.trocarEssencia(vento);
  assert.equal(escudo.essenciaAtual(), vento);
  assert.equal(escudo.empunhar({ nucleoMolhado: true }).estado, "executado");
});
