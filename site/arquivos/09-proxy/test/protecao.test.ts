import assert from "node:assert/strict";
import { test } from "node:test";
import type { EntradaPermitida, PoliticaAcesso, Sala, Visitante } from "../src/contratos.js";
import { politicaPorMandato } from "../src/politica.js";
import { ProxyDeProtecao } from "../src/proxy-protecao.js";
import { SalaReal } from "../src/sala-real.js";
import { SalaComControleProprio } from "../src/servico-com-controle.js";

const visitante: Visitante = { nome: "Mecânico", mandatoValido: true };

test("negativa não chama o serviço real", () => {
  let chamadas = 0;
  const real: Sala = { entrar: () => { chamadas++; throw new Error("Não deveria chamar."); } };
  const proxy = new ProxyDeProtecao(real, politicaPorMandato);
  assert.deepEqual(proxy.entrar({ nome: "Nobre", mandatoValido: false }), {
    estado: "negada", visitante: "Nobre", motivo: "Mandato não informado como válido.",
  });
  assert.equal(chamadas, 0);
});

test("permissão devolve o resultado real sem substituí-lo e chama uma vez", () => {
  let chamadas = 0;
  const resultado: EntradaPermitida = Object.freeze({ estado: "permitida", visitante: "Mecânico", registro: 9 });
  const real: Sala = { entrar: (pedido) => { chamadas++; assert.deepEqual(pedido, visitante); return resultado; } };
  assert.equal(new ProxyDeProtecao(real, politicaPorMandato).entrar(visitante), resultado);
  assert.equal(chamadas, 1);
});

test("a política é injetada e decide explicitamente, sem regra oculta baseada no nome", () => {
  const real = new SalaReal();
  const politica: PoliticaAcesso = (pedido) => {
    assert.equal(pedido.nome, "Mecânico");
    return { permitida: false, motivo: "Manutenção do acesso." };
  };
  assert.deepEqual(new ProxyDeProtecao(real, politica).entrar(visitante), {
    estado: "negada", visitante: "Mecânico", motivo: "Manutenção do acesso.",
  });
  assert.deepEqual(real.listarEntradas(), []);
});

test("o real registra apenas as entradas que chegam a ele, com sequência local", () => {
  const real = new SalaReal();
  const proxy = new ProxyDeProtecao(real, politicaPorMandato);
  proxy.entrar({ nome: "Nobre", mandatoValido: false });
  proxy.entrar(visitante);
  proxy.entrar({ nome: "Operadora", mandatoValido: true });
  assert.deepEqual(real.listarEntradas(), [
    { estado: "permitida", visitante: "Mecânico", registro: 1 },
    { estado: "permitida", visitante: "Operadora", registro: 2 },
  ]);
});

test("chamar o real diretamente permite contornar este proxy didático", () => {
  const real = new SalaReal();
  const semMandato = { nome: "Entrada lateral", mandatoValido: false };
  assert.equal(new ProxyDeProtecao(real, politicaPorMandato).entrar(semMandato).estado, "negada");
  assert.equal(real.entrar(semMandato).estado, "permitida");
  assert.equal(real.listarEntradas().length, 1);
});

test("erro da política é propagado e não aciona o real", () => {
  const real = new SalaReal();
  const falha = new Error("Política indisponível.");
  const proxy = new ProxyDeProtecao(real, () => { throw falha; });
  assert.throws(() => proxy.entrar(visitante), (erro: unknown) => erro === falha);
  assert.deepEqual(real.listarEntradas(), []);
});

test("erro do serviço permitido é propagado sem fabricar entrada ou negativa", () => {
  const falha = new Error("Serviço indisponível.");
  const real: Sala = { entrar: () => { throw falha; } };
  assert.throws(() => new ProxyDeProtecao(real, politicaPorMandato).entrar(visitante), (erro: unknown) => erro === falha);
});

test("nome vazio falha antes da política e nome válido é normalizado sem alterar entrada", () => {
  let decisoes = 0;
  const real = new SalaReal();
  const proxy = new ProxyDeProtecao(real, (pedido) => { decisoes++; return politicaPorMandato(pedido); });
  assert.throws(() => proxy.entrar({ nome: " ", mandatoValido: true }), { message: "Nome do visitante obrigatório." });
  assert.equal(decisoes, 0);
  const entrada = { nome: " Mecânico ", mandatoValido: true };
  assert.equal(proxy.entrar(entrada).visitante, "Mecânico");
  assert.equal(entrada.nome, " Mecânico ");
});

test("resultados são congelados e lista devolvida não permite remover histórico interno", () => {
  const real = new SalaReal();
  const proxy = new ProxyDeProtecao(real, politicaPorMandato);
  const permitida = proxy.entrar(visitante);
  const negada = proxy.entrar({ nome: "Nobre", mandatoValido: false });
  assert.equal(Reflect.set(permitida, "visitante", "Outro"), false);
  assert.equal(Reflect.set(negada, "estado", "permitida"), false);
  const lista = real.listarEntradas() as EntradaPermitida[];
  lista.pop();
  assert.equal(real.listarEntradas().length, 1);
});

test("serviço com controle próprio implementa o mesmo Subject sem real desprotegido exposto", () => {
  const servico = new SalaComControleProprio(politicaPorMandato);
  const subject: Sala = servico;
  assert.equal(subject.entrar({ nome: "Nobre", mandatoValido: false }).estado, "negada");
  assert.deepEqual(servico.listarEntradas(), []);
  assert.deepEqual(subject.entrar(visitante), { estado: "permitida", visitante: "Mecânico", registro: 1 });
});
