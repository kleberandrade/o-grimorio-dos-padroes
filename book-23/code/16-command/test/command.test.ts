import assert from "node:assert/strict";
import { test } from "node:test";
import { ComandoReservar } from "../src/comando.js";
import { EstoqueMinerio } from "../src/estoque.js";
import { Invocador } from "../src/invocador.js";

function totais(estoque: EstoqueMinerio) {
  const { disponivel, reservado, forjado } = estoque.snapshot();
  return { disponivel, reservado, forjado };
}

test("executar reserva muda estado real e histórico; desfazer restitui a parcela intacta", () => {
  const estoque = new EstoqueMinerio(12);
  const livro = new Invocador();
  const ordem = new ComandoReservar(estoque, 8);
  const antes = estoque.snapshot();
  assert.deepEqual(livro.listarHistorico(), []);
  assert.deepEqual(totais(estoque), { disponivel: 12, reservado: 0, forjado: 0 });
  livro.executar(ordem);
  assert.deepEqual(totais(estoque), { disponivel: 4, reservado: 8, forjado: 0 });
  assert.deepEqual(livro.listarHistorico(), [{ descricao: "reservar 8" }]);
  assert.deepEqual(ordem.situacao().antes, antes);
  assert.equal(livro.desfazerUltimo(), true);
  assert.deepEqual(estoque.snapshot(), antes);
  assert.equal(ordem.situacao().estado, "desfeito");
  assert.deepEqual(livro.listarHistorico(), []);
});

test("histórico vazio retorna false sem modificar receptor", () => {
  const estoque = new EstoqueMinerio(1);
  assert.equal(new Invocador().desfazerUltimo(), false);
  assert.deepEqual(totais(estoque), { disponivel: 1, reservado: 0, forjado: 0 });
});

test("falta de estoque não produz efeito nem histórico; tentativa sem sucesso pode ser refeita", () => {
  const estoque = new EstoqueMinerio(2);
  const outra = estoque.reservar(2);
  const livro = new Invocador();
  const ordem = new ComandoReservar(estoque, 1);
  const antes = estoque.snapshot();
  assert.throws(() => livro.executar(ordem), { message: "Estoque insuficiente." });
  assert.deepEqual(estoque.snapshot(), antes);
  assert.deepEqual(livro.listarHistorico(), []);
  assert.equal(ordem.situacao().estado, "novo");
  assert.equal(ordem.situacao().antes, null);
  estoque.cancelar(outra);
  livro.executar(ordem);
  assert.equal(livro.listarHistorico().length, 1);
  assert.deepEqual(totais(estoque), { disponivel: 1, reservado: 1, forjado: 0 });
});

test("quantidades inválidas são recusadas sem efeitos e estoque inicial admite zero", () => {
  const estoque = new EstoqueMinerio(5);
  const antes = estoque.snapshot();
  for (const invalida of [0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => estoque.reservar(invalida));
    assert.throws(() => new ComandoReservar(estoque, invalida));
  }
  assert.deepEqual(estoque.snapshot(), antes);
  assert.equal(new EstoqueMinerio(0).snapshot().disponivel, 0);
  for (const inicial of [-1, 0.5, NaN, Infinity]) assert.throws(() => new EstoqueMinerio(inicial));
});

test("repetir execução, reexecutar após undo e repetir undo são recusados sem duplicar efeito", () => {
  const estoque = new EstoqueMinerio(5);
  const livro = new Invocador();
  const ordem = new ComandoReservar(estoque, 2);
  assert.throws(() => ordem.desfazer());
  livro.executar(ordem);
  assert.throws(() => livro.executar(ordem));
  assert.equal(livro.listarHistorico().length, 1);
  assert.equal(estoque.snapshot().reservado, 2);
  livro.desfazerUltimo();
  assert.throws(() => ordem.desfazer());
  assert.throws(() => livro.executar(ordem));
  livro.executar(new ComandoReservar(estoque, 2));
  assert.throws(() => ordem.desfazer());
  assert.equal(estoque.snapshot().reservado, 2);
  assert.equal(livro.listarHistorico().length, 1);
});

test("undo usa a reserva específica, preservando outra reserva e forja posteriores", () => {
  const estoque = new EstoqueMinerio(12);
  const livro = new Invocador();
  livro.executar(new ComandoReservar(estoque, 8));
  const outra = estoque.reservar(4);
  estoque.forjar(outra, 4);
  livro.desfazerUltimo();
  assert.deepEqual(totais(estoque), { disponivel: 8, reservado: 0, forjado: 4 });
  assert.notEqual(estoque.snapshot().forjado, 0); // Não restaurou um snapshot global antigo.
});

for (const consumido of [3, 6]) {
  test(`consumir ${consumido} de uma reserva de 6 impede undo e mantém topo/evidência`, () => {
    const estoque = new EstoqueMinerio(10);
    const livro = new Invocador();
    const ordem = new ComandoReservar(estoque, 6);
    livro.executar(ordem);
    assert.notEqual(ordem.reserva, null);
    estoque.forjar(ordem.reserva!, consumido);
    const antes = estoque.snapshot();
    assert.throws(() => livro.desfazerUltimo());
    assert.deepEqual(estoque.snapshot(), antes);
    assert.equal(livro.listarHistorico().length, 1);
    assert.equal(ordem.situacao().estado, "executado");
    assert.equal(estoque.snapshot().forjado, consumido);
  });
}

test("limite descarta entrada mais antiga, conserva seu efeito e perde undo pelo invocador", () => {
  const estoque = new EstoqueMinerio(10);
  const livro = new Invocador(1);
  livro.executar(new ComandoReservar(estoque, 2));
  livro.executar(new ComandoReservar(estoque, 3));
  assert.deepEqual(livro.listarHistorico(), [{ descricao: "reservar 3" }]);
  assert.equal(estoque.snapshot().reservado, 5);
  livro.desfazerUltimo();
  assert.equal(livro.desfazerUltimo(), false);
  assert.deepEqual(totais(estoque), { disponivel: 8, reservado: 2, forjado: 0 });
});

test("ordem LIFO desfaz duas parcelas e limites de histórico inválidos são recusados", () => {
  const estoque = new EstoqueMinerio(10);
  const livro = new Invocador(2);
  livro.executar(new ComandoReservar(estoque, 2));
  livro.executar(new ComandoReservar(estoque, 3));
  livro.desfazerUltimo();
  assert.equal(estoque.snapshot().reservado, 2);
  livro.desfazerUltimo();
  assert.equal(estoque.snapshot().disponivel, 10);
  for (const invalido of [0, -1, 0.5, NaN, Infinity]) assert.throws(() => new Invocador(invalido));
});

test("token exige identidade e estoque de origem; copiar campos não fabrica uma reserva", () => {
  const estoque = new EstoqueMinerio(10);
  const reserva = estoque.reservar(3);
  const antes = estoque.snapshot();
  assert.throws(() => estoque.cancelar({ ...reserva }));
  assert.throws(() => new EstoqueMinerio(10).forjar(reserva, 1));
  assert.equal(Reflect.set(reserva, "quantidade", 1), false);
  assert.deepEqual(estoque.snapshot(), antes);
});

test("forja recusa excesso e quantidade inválida sem consumir reserva", () => {
  const estoque = new EstoqueMinerio(5);
  const reserva = estoque.reservar(2);
  const antes = estoque.snapshot();
  for (const quantidade of [0, -1, 0.5, Infinity, 3]) assert.throws(() => estoque.forjar(reserva, quantidade));
  assert.deepEqual(estoque.snapshot(), antes);
});

test("snapshots e histórico não dão acesso mutável ao estoque ou à pilha interna", () => {
  const estoque = new EstoqueMinerio(5);
  const livro = new Invocador();
  livro.executar(new ComandoReservar(estoque, 2));
  const snapshot = estoque.snapshot();
  assert.equal(Reflect.set(snapshot, "disponivel", 100), false);
  assert.equal(Reflect.set(snapshot.reservasAtivas[0]!, "restante", 100), false);
  assert.equal(Reflect.set(snapshot.reservasAtivas, "0", {}), false);
  const historico = livro.listarHistorico() as { descricao: string }[];
  assert.equal(Reflect.set(historico[0]!, "descricao", "outra"), false);
  historico.pop();
  assert.equal(livro.listarHistorico().length, 1);
  livro.desfazerUltimo();
  assert.equal(snapshot.reservado, 2);
  assert.equal(estoque.snapshot().reservado, 0);
});
