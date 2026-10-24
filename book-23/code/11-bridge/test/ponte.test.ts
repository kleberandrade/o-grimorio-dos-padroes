import assert from "node:assert/strict";
import { test } from "node:test";
import { Arco, Espada } from "../src/armas.js";
import type { Essencia } from "../src/contratos.js";
import { empunharEspadaDireta } from "../src/direto.js";
import { EssenciaFogo, EssenciaGelo } from "../src/essencias.js";

const seco = { nucleoMolhado: false };

test("a matriz 2×2 combina dois eixos sem classes por par", () => {
  const resultados = [
    new Espada(new EssenciaFogo()).empunhar(seco),
    new Espada(new EssenciaGelo()).empunhar(seco),
    new Arco(new EssenciaFogo()).empunhar(seco),
    new Arco(new EssenciaGelo()).empunhar(seco),
  ];
  assert.deepEqual(resultados, [
    { estado: "executado", forma: "espada", essencia: "fogo", custo: 4, efeitos: ["corte", "calor"] },
    { estado: "executado", forma: "espada", essencia: "gelo", custo: 5, efeitos: ["corte", "frio"] },
    { estado: "executado", forma: "arco", essencia: "fogo", custo: 5, efeitos: ["disparo", "calor"] },
    { estado: "executado", forma: "arco", essencia: "gelo", custo: 6, efeitos: ["disparo", "frio"] },
  ]);
});

test("trocar essência mantém identidade da arma e altera só seu vínculo", () => {
  const fogo = new EssenciaFogo();
  const gelo = new EssenciaGelo();
  const espada = new Espada(fogo);
  const outra = new Arco(fogo);
  const identidade = espada;
  const antes = espada.empunhar(seco);
  assert.equal(espada.essenciaAtual(), fogo);
  espada.trocarEssencia(gelo);
  assert.equal(espada, identidade);
  assert.equal(espada.essenciaAtual(), gelo);
  assert.equal(outra.essenciaAtual(), fogo);
  assert.equal(espada.empunhar(seco).essencia, "gelo");
  assert.equal(antes.essencia, "fogo");
  assert.deepEqual(antes.efeitos, ["corte", "calor"]);
});

test("restrição do fogo bloqueia ambos os formatos sem produzir gesto nem cobrar custo", () => {
  for (const Forma of [Espada, Arco]) {
    const resultado = new Forma(new EssenciaFogo()).empunhar({ nucleoMolhado: true });
    assert.equal(resultado.estado, "bloqueado");
    assert.equal(resultado.custo, 0);
    assert.deepEqual(resultado.efeitos, []);
    if (resultado.estado !== "bloqueado") throw new Error("Resultado inesperado.");
    assert.equal(resultado.motivo, "Fogo não ativa com núcleo molhado.");
  }
});

test("gelo pode ativar no mesmo contexto molhado, com custo maior declarado", () => {
  assert.deepEqual(new Espada(new EssenciaGelo()).empunhar({ nucleoMolhado: true }), {
    estado: "executado", forma: "espada", essencia: "gelo", custo: 5, efeitos: ["corte", "frio"],
  });
});

test("novo implementador é recebido por ambas as abstrações e recebe o contexto uma vez", () => {
  const contextos: boolean[] = [];
  const nova: Essencia = {
    nome: "teste",
    ativar: (contexto) => { contextos.push(contexto.nucleoMolhado); return { estado: "ativa", custo: 2, efeito: "pulso" }; },
  };
  assert.deepEqual(new Espada(nova).empunhar(seco).efeitos, ["corte", "pulso"]);
  assert.deepEqual(new Arco(nova).empunhar({ nucleoMolhado: true }).efeitos, ["disparo", "pulso"]);
  assert.deepEqual(contextos, [false, true]);
});

test("cada execução devolve resultado e lista independentes congelados", () => {
  const espada = new Espada(new EssenciaFogo());
  const primeiro = espada.empunhar(seco);
  const segundo = espada.empunhar(seco);
  assert.deepEqual(primeiro, segundo);
  assert.notEqual(primeiro, segundo);
  assert.notEqual(primeiro.efeitos, segundo.efeitos);
  assert.equal(Reflect.set(primeiro, "custo", 90), false);
  assert.throws(() => (primeiro.efeitos as string[]).pop(), TypeError);
});

test("falha da essência é propagada sem substituir a implementação ou fabricar resultado", () => {
  const falha = new Error("Essência indisponível.");
  const essencia: Essencia = { nome: "falha", ativar: () => { throw falha; } };
  const arma = new Espada(essencia);
  assert.throws(() => arma.empunhar(seco), (erro: unknown) => erro === falha);
  assert.equal(arma.essenciaAtual(), essencia);
});

test("custo inválido ou soma fora da faixa segura é recusado", () => {
  for (const custo of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER]) {
    const essencia: Essencia = { nome: "teste", ativar: () => ({ estado: "ativa", custo, efeito: "pulso" }) };
    assert.throws(() => new Espada(essencia).empunhar(seco), { message: "Custo deve ser inteiro seguro não negativo." });
  }
});

test("custo zero do implementador é válido e preserva o custo da forma", () => {
  const essencia: Essencia = { nome: "neutra", ativar: () => ({ estado: "ativa", custo: 0, efeito: "sem alteração" }) };
  assert.equal(new Espada(essencia).empunhar(seco).custo, 1);
});

test("para uma forma fixa, a função direta compõe essência sem hierarquia adicional", () => {
  const fogo = new EssenciaFogo();
  assert.deepEqual(empunharEspadaDireta(fogo, seco), new Espada(fogo).empunhar(seco));
});
