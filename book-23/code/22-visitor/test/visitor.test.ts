import assert from "node:assert/strict";
import { test } from "node:test";
import { Guerreiro, Mago, Arqueiro } from "../src/membros.js";
import type { Visitante, MembroGuilda } from "../src/contratos.js";
import { CalcularCapacidade, CalcularCusto, totalizar } from "../src/visitantes.js";
import { avaliarFicha } from "../src/union.js";
import type { Ficha } from "../src/union.js";

const membros = () => [new Guerreiro("Ivo", 6), new Mago("Lume", 4), new Arqueiro("Cora", 5)] as const;

test("aceitar despacha uma vez para o método tipado correto e entrega a identidade do elemento", () => {
  const grupo = membros();
  const chamadas: string[] = [];
  const visitante: Visitante<string> = {
    visitarGuerreiro: (membro) => { assert.equal(membro, grupo[0]); chamadas.push("guerreiro"); return "G"; },
    visitarMago: (membro) => { assert.equal(membro, grupo[1]); chamadas.push("mago"); return "M"; },
    visitarArqueiro: (membro) => { assert.equal(membro, grupo[2]); chamadas.push("arqueiro"); return "A"; },
  };
  assert.deepEqual(grupo.map((membro) => membro.aceitar(visitante)), ["G", "M", "A"]);
  assert.deepEqual(chamadas, ["guerreiro", "mago", "arqueiro"]);
});

test("capacidade e abastecimento retornam operações numéricas distintas, agregáveis e exatas", () => {
  const grupo = membros(); const capacidade = new CalcularCapacidade(); const custo = new CalcularCusto();
  assert.deepEqual(grupo.map((membro) => membro.aceitar(capacidade)), [12, 12, 10]);
  assert.deepEqual(grupo.map((membro) => membro.aceitar(custo)), [16, 13, 20]);
  assert.equal(totalizar(grupo, capacidade), 34);
  assert.equal(totalizar(grupo, custo), 49);
  assert.equal(totalizar([], capacidade), 0);
});

test("nova operação funciona sobre os mesmos elementos já preparados, sem editar seu código", () => {
  const grupo = membros();
  const cracha: Visitante<string> = {
    visitarGuerreiro: (membro) => `G:${membro.nome}`, visitarMago: (membro) => `M:${membro.nome}`,
    visitarArqueiro: (membro) => `A:${membro.nome}`,
  };
  assert.deepEqual(grupo.map((membro) => membro.aceitar(cracha)), ["G:Ivo", "M:Lume", "A:Cora"]);
  assert.equal(grupo[0].aceitar(new CalcularCapacidade()), 12);
});

test("alternativa union sobre poucos casos calcula os mesmos resultados sem Visitor", () => {
  const grupo = membros();
  const fichas = [{ tipo: "guerreiro", nome: "Ivo", forca: 6 }, { tipo: "mago", nome: "Lume", mana: 4 },
    { tipo: "arqueiro", nome: "Cora", pontaria: 5 }] as const;
  const capacidade = new CalcularCapacidade(); const custo = new CalcularCusto();
  fichas.forEach((ficha, indice) => assert.deepEqual(avaliarFicha(ficha), {
    capacidade: grupo[indice]!.aceitar(capacidade), custo: grupo[indice]!.aceitar(custo),
  }));
});

test("valores fronteira zero/cem têm resultado definido sem deduzir recursos ou distribuir estoque", () => {
  const capacidade = new CalcularCapacidade(); const custo = new CalcularCusto();
  assert.deepEqual([new Guerreiro("G", 0), new Mago("M", 0), new Arqueiro("A", 0)].map((membro) => membro.aceitar(capacidade)), [0, 0, 0]);
  assert.deepEqual([new Guerreiro("G", 100), new Mago("M", 100), new Arqueiro("A", 100)].map((membro) => membro.aceitar(custo)), [110, 205, 115]);
});

test("nomes e índices inválidos são recusados, inclusive nos dados da alternativa", () => {
  for (const Tipo of [Guerreiro, Mago, Arqueiro]) {
    assert.throws(() => new Tipo(" ", 1));
    for (const invalido of [-1, 101, 0.5, NaN, Infinity]) assert.throws(() => new Tipo("Nome", invalido));
  }
  assert.throws(() => avaliarFicha({ tipo: "guerreiro", nome: "Nome", forca: -1 }));
  assert.throws(() => avaliarFicha({ tipo: "outro", nome: "Nome" } as unknown as Ficha), { message: "Tipo de ficha inválido." });
});

test("dados públicos legítimos ficam congelados; chamadas fornecidas preservam membros e array", () => {
  const grupo: MembroGuilda[] = [...membros()];
  const antes = grupo.map((membro) => ({ ...membro }));
  assert.equal(Reflect.set(grupo[0]!, "nome", "Mudou"), false);
  assert.equal(Reflect.set(grupo[0]!, "forca", 100), false);
  totalizar(grupo, new CalcularCapacidade()); totalizar(grupo, new CalcularCusto());
  assert.deepEqual(grupo.map((membro) => ({ ...membro })), antes);
  assert.equal(grupo.length, 3);
});

test("totalizador recusa número de extensão fora do contrato e overflow sem declarar pureza universal", () => {
  for (const valor of [-1, 0.5, NaN, Infinity]) {
    const invalido: Visitante<number> = { visitarGuerreiro: () => valor, visitarMago: () => valor, visitarArqueiro: () => valor };
    assert.throws(() => totalizar(membros(), invalido));
  }
  const enorme: Visitante<number> = { visitarGuerreiro: () => Number.MAX_SAFE_INTEGER,
    visitarMago: () => Number.MAX_SAFE_INTEGER, visitarArqueiro: () => Number.MAX_SAFE_INTEGER };
  assert.throws(() => totalizar(membros(), enorme));
});

test("erro de visitante externo é propagado; efeito externo anterior não é revertido", () => {
  let visitas = 0;
  const falha = new Error("Visitante externo falhou.");
  const visitante: Visitante<number> = { visitarGuerreiro: () => { visitas += 1; throw falha; },
    visitarMago: () => 0, visitarArqueiro: () => 0 };
  assert.throws(() => totalizar(membros(), visitante), (erro: unknown) => erro === falha);
  assert.equal(visitas, 1);
});
