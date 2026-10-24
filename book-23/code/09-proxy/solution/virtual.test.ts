import assert from "node:assert/strict";
import { test } from "node:test";
import type { Sala } from "../src/contratos.js";
import { SalaReal } from "../src/sala-real.js";
import { ProxyVirtual } from "./proxy-virtual.js";

const visitante = { nome: "Mecânico", mandatoValido: true };

test("virtual não cria antes do uso e reutiliza uma instância nas operações seguintes", () => {
  const reaisCriados: SalaReal[] = [];
  const virtual = new ProxyVirtual(() => {
    const real = new SalaReal();
    reaisCriados.push(real);
    return real;
  });
  assert.equal(reaisCriados.length, 0);
  assert.equal(virtual.entrar(visitante).estado, "permitida");
  assert.equal(reaisCriados.length, 1);
  virtual.entrar(visitante);
  assert.equal(reaisCriados.length, 1);
  const real = reaisCriados[0];
  assert.ok(real);
  assert.equal(real.listarEntradas().length, 2);
});

test("virtualização sozinha não adiciona política de proteção", () => {
  const virtual = new ProxyVirtual(() => new SalaReal());
  assert.equal(virtual.entrar({ nome: "Sem mandato", mandatoValido: false }).estado, "permitida");
});

test("carregador que falha é propagado; próxima operação explícita pode tentar de novo", () => {
  let tentativas = 0;
  const falha = new Error("Carga indisponível.");
  const virtual = new ProxyVirtual(() => {
    tentativas++;
    if (tentativas === 1) throw falha;
    return new SalaReal();
  });
  assert.throws(() => virtual.entrar(visitante), (erro: unknown) => erro === falha);
  assert.equal(tentativas, 1);
  assert.equal(virtual.entrar(visitante).estado, "permitida");
  assert.equal(tentativas, 2);
});

test("falha na operação depois da carga não descarta instância nem recarrega", () => {
  let criacoes = 0;
  let operacoes = 0;
  const falha = new Error("Entrada indisponível.");
  const real: Sala = { entrar: () => { operacoes++; throw falha; } };
  const virtual = new ProxyVirtual(() => { criacoes++; return real; });
  assert.throws(() => virtual.entrar(visitante), (erro: unknown) => erro === falha);
  assert.throws(() => virtual.entrar(visitante), (erro: unknown) => erro === falha);
  assert.equal(criacoes, 1);
  assert.equal(operacoes, 2);
});
