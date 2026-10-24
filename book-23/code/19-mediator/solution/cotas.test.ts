import assert from "node:assert/strict";
import { test } from "node:test";
import { planejarCotas } from "./cotas.js";
import { montarConselho } from "../src/montagem.js";

test("política separada aloca por ordem, conserva limite e mostra custo da prioridade escolhida", () => {
  const pedidos = [{ grupo: "barqueiros", quantidade: 8 }, { grupo: "cultivadores", quantidade: 6 }];
  const plano = planejarCotas(10, pedidos);
  assert.deepEqual(plano.cotas.map((item) => item.concedido), [8, 2]);
  assert.equal(plano.restante, 0);
  const invertido = planejarCotas(10, [...pedidos].reverse());
  assert.deepEqual(invertido.cotas.map((item) => item.concedido), [6, 4]);
  assert.equal(plano.cotas.reduce((total, item) => total + item.concedido, plano.restante), 10);
});

test("cotas não substituem inspeção, amarras ou autorização do mediador", () => {
  const posto = montarConselho();
  posto.barqueiros.pedirAbertura();
  planejarCotas(10, [{ grupo: "grupo", quantidade: 2 }]);
  assert.equal(posto.conselho.snapshot().estado, "aguardando-inspecao");
  assert.equal(posto.guarda.confirmarAutorizacao(true).status, "rejeitado");
  assert.equal(posto.guarda.snapshot().aberta, false);
});

test("entradas/planos independentes e congelados; disponibilidade zero e pedidos vazios são válidos", () => {
  const entrada = [{ grupo: " grupo ", quantidade: 2 }];
  const plano = planejarCotas(5, entrada);
  entrada[0]!.grupo = "mudou";
  entrada[0]!.quantidade = 100;
  assert.equal(plano.cotas[0]!.grupo, "grupo");
  assert.equal(plano.cotas[0]!.concedido, 2);
  assert.equal(plano.restante, 3);
  assert.equal(Reflect.set(plano.cotas[0]!, "concedido", 100), false);
  assert.equal(Reflect.set(plano.cotas, "0", {}), false);
  assert.deepEqual(planejarCotas(0, [{ grupo: "grupo", quantidade: 2 }]).cotas.map((item) => item.concedido), [0]);
  assert.deepEqual(planejarCotas(5, []), { cotas: [], restante: 5 });
});

test("valores inválidos e grupos duplicados após normalização são recusados", () => {
  for (const disponivel of [-1, 0.5, NaN, Infinity]) assert.throws(() => planejarCotas(disponivel, []));
  for (const quantidade of [0, -1, 0.5, NaN, Infinity]) assert.throws(() => planejarCotas(5, [{ grupo: "grupo", quantidade }]));
  assert.throws(() => planejarCotas(5, [{ grupo: " ", quantidade: 1 }]));
  assert.throws(() => planejarCotas(5, [{ grupo: "grupo", quantidade: 1 }, { grupo: " grupo ", quantidade: 1 }]));
});
