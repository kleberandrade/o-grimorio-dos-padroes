import assert from "node:assert/strict";
import { test } from "node:test";
import { Combatente } from "../src/combatente.js";
import type { Alvo, EstrategiaDeAtaque, ResultadoAtaque } from "../src/contratos.js";
import { AtaqueArco, AtaqueEspada, AtaqueMagia } from "../src/estrategias.js";

const distante: Alvo = { nome: "Corda", distanciaMetros: 12, resistencia: "comum" };

test("trocar técnica conserva o contexto e muda o resultado para o mesmo alvo", () => {
  const espada = new AtaqueEspada();
  const arco = new AtaqueArco();
  const rima = new Combatente(" Rima ", espada);
  const identidade = rima;
  assert.equal(rima.atacar(distante).estado, "inadequado");
  rima.trocarEstrategia(arco);
  assert.equal(rima, identidade);
  assert.equal(rima.nome, "Rima");
  assert.equal(rima.estrategiaAtual(), arco);
  assert.deepEqual(rima.atacar(distante), { estado: "executado", tecnica: "arco", alvo: "Corda", custo: 2, efeito: "disparo à distância" });
});

test("uma nova estratégia funciona sem alterar o contexto e recebe dados normalizados", () => {
  let chamadas = 0;
  const resposta: ResultadoAtaque = Object.freeze({ estado: "executado", tecnica: "ensaio", alvo: "Corda", custo: 0, efeito: "marcação" });
  const nova: EstrategiaDeAtaque = { atacar: (alvo) => {
    chamadas++;
    assert.equal(alvo.nome, "Corda");
    assert.equal(Object.isFrozen(alvo), true);
    return resposta;
  } };
  const contexto = new Combatente("Rima", nova);
  assert.equal(contexto.atacar({ ...distante, nome: " Corda " }), resposta);
  assert.equal(chamadas, 1);
});

test("resistência reforçada recusa espada e arco sem custo, mas magia atende ao objetivo", () => {
  const alvo: Alvo = { nome: "Selo", distanciaMetros: 2, resistencia: "reforcada" };
  for (const estrategia of [new AtaqueEspada(), new AtaqueArco()]) {
    const resultado = estrategia.atacar(alvo);
    assert.equal(resultado.estado, "inadequado");
    assert.equal(resultado.custo, 0);
  }
  assert.deepEqual(new AtaqueMagia().atacar(alvo), {
    estado: "executado", tecnica: "magia", alvo: "Selo", custo: 5, efeito: "pulso contra a resistência",
  });
});

test("intervalos de distância têm fronteiras explícitas", () => {
  const alvo = { nome: "Marca", resistencia: "comum" } as const;
  assert.equal(new AtaqueEspada().atacar({ ...alvo, distanciaMetros: 2 }).estado, "executado");
  assert.equal(new AtaqueEspada().atacar({ ...alvo, distanciaMetros: 2.1 }).estado, "inadequado");
  assert.equal(new AtaqueArco().atacar({ ...alvo, distanciaMetros: 1.9 }).estado, "inadequado");
  assert.equal(new AtaqueArco().atacar({ ...alvo, distanciaMetros: 2 }).estado, "executado");
  assert.equal(new AtaqueArco().atacar({ ...alvo, distanciaMetros: 30 }).estado, "executado");
  assert.equal(new AtaqueArco().atacar({ ...alvo, distanciaMetros: 30.1 }).estado, "inadequado");
  assert.equal(new AtaqueMagia().atacar({ ...alvo, distanciaMetros: 15 }).estado, "executado");
  assert.equal(new AtaqueMagia().atacar({ ...alvo, distanciaMetros: 15.1 }).estado, "inadequado");
});

test("mesmo alvo próximo pode ter técnicas adequadas com custos diferentes, sem seleção automática", () => {
  const perto: Alvo = { nome: "Marca", distanciaMetros: 2, resistencia: "comum" };
  assert.equal(new AtaqueEspada().atacar(perto).custo, 1);
  assert.equal(new AtaqueArco().atacar(perto).custo, 2);
  assert.equal(new AtaqueMagia().atacar(perto).custo, 5);
});

for (const distanciaMetros of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
  test(`distância ${distanciaMetros} é erro de entrada, não rejeição tática`, () => {
    assert.throws(() => new Combatente("Rima", new AtaqueEspada()).atacar({ ...distante, distanciaMetros }), {
      message: "Distância deve ser não negativa e finita.",
    });
  });
}

test("nome vazio é recusado e resultados não mutam alvo nem valores anteriores", () => {
  assert.throws(() => new Combatente(" ", new AtaqueEspada()), { message: "Nome obrigatório." });
  const alvo = { nome: " Marca ", distanciaMetros: 1, resistencia: "comum" } as const;
  const contexto = new Combatente("Rima", new AtaqueEspada());
  const primeiro = contexto.atacar(alvo);
  const segundo = contexto.atacar(alvo);
  assert.equal(alvo.nome, " Marca ");
  assert.deepEqual(primeiro, segundo);
  assert.notEqual(primeiro, segundo);
  assert.equal(Reflect.set(primeiro, "custo", 99), false);
  contexto.trocarEstrategia(new AtaqueMagia());
  assert.equal(primeiro.tecnica, "espada");
});

test("erro de estratégia externa é propagado sem troca automática", () => {
  const falha = new Error("Técnica indisponível.");
  const estrategia: EstrategiaDeAtaque = { atacar: () => { throw falha; } };
  const contexto = new Combatente("Rima", estrategia);
  assert.throws(() => contexto.atacar(distante), (erro: unknown) => erro === falha);
  assert.equal(contexto.estrategiaAtual(), estrategia);
});
