import assert from "node:assert/strict";
import { test } from "node:test";
import type { Alvo } from "../src/contratos.js";
import { AtaqueArco } from "../src/estrategias.js";
import { ataqueArcoFuncao, criarContextoFuncional } from "./funcional.js";

test("função e objeto de estratégia devolvem os mesmos dados nos casos adequados e inadequados", () => {
  const objeto = new AtaqueArco();
  const casos: Alvo[] = [
    { nome: " Corda ", distanciaMetros: 12, resistencia: "comum" },
    { nome: "Perto", distanciaMetros: 1, resistencia: "comum" },
    { nome: "Longe", distanciaMetros: 31, resistencia: "comum" },
    { nome: "Selo", distanciaMetros: 6, resistencia: "reforcada" },
  ];
  for (const alvo of casos) assert.deepEqual(ataqueArcoFuncao(alvo), objeto.atacar(alvo));
});

test("contexto funcional troca a política preservando identidade e contrato de resultado", () => {
  const contexto = criarContextoFuncional("Rima", ataqueArcoFuncao);
  const identidade = contexto;
  const alvo: Alvo = { nome: "Corda", distanciaMetros: 12, resistencia: "comum" };
  assert.equal(contexto.atacar(alvo).tecnica, "arco");
  contexto.trocarEstrategia((pedido) => Object.freeze({ estado: "executado", tecnica: "marcação", alvo: pedido.nome, custo: 0, efeito: "sinal local" }));
  assert.equal(contexto, identidade);
  assert.equal(contexto.nome, "Rima");
  assert.equal(contexto.atacar(alvo).tecnica, "marcação");
});
