import assert from "node:assert/strict";
import { test } from "node:test";
import { Oraculo } from "../src/oraculo.js";
import { EscopoDeInscricoes } from "./escopo.js";

const aviso = { mensagem: "Troca de turno.", local: "Torre" };

test("encerrar turno remove seu conjunto, preserva vínculo externo e não admite novas inscrições", () => {
  const oraculo = new Oraculo();
  const turno = new EscopoDeInscricoes();
  oraculo.inscrever("Externo", () => {});
  turno.inscrever(oraculo, "Turno1", () => {});
  turno.inscrever(oraculo, "Turno2", () => {});
  assert.equal(turno.encerrar(), 2);
  assert.equal(turno.encerrar(), 0);
  assert.throws(() => turno.inscrever(oraculo, "Tardio", () => {}), { message: "Escopo já encerrado." });
  assert.deepEqual(oraculo.emitir(aviso).reacoes, [{ nome: "Externo", status: "concluiu" }]);
});

test("encerramento em callback mantém destinatários da rodada corrente e esvazia a seguinte", () => {
  const oraculo = new Oraculo();
  const turno = new EscopoDeInscricoes();
  let feitas = 0;
  turno.inscrever(oraculo, "Encerra", () => { turno.encerrar(); });
  turno.inscrever(oraculo, "Escriba", () => { feitas += 1; });
  assert.equal(oraculo.emitir(aviso).reacoes.length, 2);
  assert.equal(oraculo.emitir(aviso).reacoes.length, 0);
  assert.equal(feitas, 1);
});

test("handle guardado por turno antigo não desliga reinscrição pertencente ao novo turno", () => {
  const oraculo = new Oraculo();
  const antigo = new EscopoDeInscricoes();
  const novo = new EscopoDeInscricoes();
  const observar = () => {};
  const retirar = antigo.inscrever(oraculo, "Antigo", observar);
  retirar();
  novo.inscrever(oraculo, "Novo", observar);
  assert.equal(antigo.encerrar(), 0);
  assert.deepEqual(oraculo.emitir(aviso).reacoes, [{ nome: "Novo", status: "concluiu" }]);
  assert.equal(novo.encerrar(), 1);
});

test("reentrância continua recusada com escopo; encerramento remove o ciclo para o próximo aviso", () => {
  const oraculo = new Oraculo();
  const turno = new EscopoDeInscricoes();
  turno.inscrever(oraculo, "Recursivo", () => { oraculo.emitir(aviso); });
  turno.inscrever(oraculo, "Fim", () => { turno.encerrar(); });
  assert.deepEqual(oraculo.emitir(aviso).reacoes.map((item) => item.status), ["falhou", "concluiu"]);
  assert.deepEqual(oraculo.emitir(aviso).reacoes, []);
});
