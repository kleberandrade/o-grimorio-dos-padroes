import assert from "node:assert/strict";
import { test } from "node:test";
import { Invocador } from "../src/invocador.js";
import { AvisosSimulados, ComandoAvisar } from "./avisos.js";
import type { RegistroAviso } from "./avisos.js";

test("compensação acrescenta outro registro vinculado sem apagar aviso original", () => {
  const porta = new AvisosSimulados();
  const livro = new Invocador();
  livro.executar(new ComandoAvisar(porta, " Reserva liberada. "));
  const original = porta.listar()[0];
  livro.desfazerUltimo();
  assert.deepEqual(porta.listar(), [
    { id: 1, tipo: "aviso", texto: "Reserva liberada.", referencia: null },
    { id: 2, tipo: "compensacao", texto: "Desconsidere o aviso referenciado.", referencia: 1 },
  ]);
  assert.equal(porta.listar()[0], original);
  assert.equal(livro.listarHistorico().length, 0);
});

test("falha simulada da compensação mantém aviso e histórico; nova tentativa pode concluir", () => {
  const porta = new AvisosSimulados();
  const livro = new Invocador();
  livro.executar(new ComandoAvisar(porta, "Aviso original."));
  porta.falharProximaCompensacao();
  assert.throws(() => livro.desfazerUltimo(), { message: "Falha simulada antes de registrar compensação." });
  assert.equal(porta.listar().length, 1);
  assert.equal(livro.listarHistorico().length, 1);
  assert.equal(livro.desfazerUltimo(), true);
  assert.equal(porta.listar().length, 2);
});

test("repetição local da mesma instância é recusada, outra ordem pode emitir aviso igual", () => {
  const porta = new AvisosSimulados();
  const comando = new ComandoAvisar(porta, "Aviso.");
  assert.throws(() => comando.desfazer());
  comando.executar();
  assert.throws(() => comando.executar());
  comando.desfazer();
  assert.throws(() => comando.desfazer());
  assert.throws(() => comando.executar());
  new ComandoAvisar(porta, "Aviso.").executar();
  assert.equal(porta.listar().filter((registro) => registro.tipo === "aviso").length, 2);
});

test("registros são protegidos e inválidos não produzem aviso ou compensação", () => {
  const porta = new AvisosSimulados();
  assert.throws(() => new ComandoAvisar(porta, " "));
  assert.throws(() => porta.emitir(" "));
  assert.throws(() => porta.compensar(99));
  porta.emitir("Aviso.");
  const lista = porta.listar() as RegistroAviso[];
  assert.equal(Reflect.set(lista[0]!, "texto", "apagado"), false);
  lista.pop();
  assert.equal(porta.listar().length, 1);
});
