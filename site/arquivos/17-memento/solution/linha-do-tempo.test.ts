import assert from "node:assert/strict";
import { test } from "node:test";
import { Diario } from "../src/diario.js";
import { LinhaDoTempo } from "./linha-do-tempo.js";

const estado = (conteudo: string) => ({ conteudo, contexto: { local: "Arquivo", marcadores: [conteudo] } });

test("checkpoint inicial, confirmação explícita, undo e redo restauram estados completos", () => {
  const diario = new Diario(estado("A"));
  const linha = new LinhaDoTempo(diario.portaMemorias(), 3);
  assert.deepEqual(linha.listar(), [{ indice: 0, rotulo: "Inicial", atual: true }]);
  assert.equal(linha.undo(), false);
  assert.equal(linha.redo(), false);
  diario.substituir(estado("B"));
  linha.confirmar("B");
  diario.substituir(estado("C"));
  linha.confirmar("C");
  assert.equal(linha.undo(), true);
  assert.deepEqual(diario.ler(), estado("B"));
  assert.equal(linha.undo(), true);
  assert.deepEqual(diario.ler(), estado("A"));
  assert.equal(linha.redo(), true);
  assert.deepEqual(diario.ler(), estado("B"));
  assert.equal(linha.redo(), true);
  assert.deepEqual(diario.ler(), estado("C"));
});

test("edição pendente recusa navegação inclusive nas bordas, sem perder texto ou mover cursor", () => {
  const diario = new Diario(estado("A"));
  const linha = new LinhaDoTempo(diario.portaMemorias());
  diario.substituir(estado("Pendente"));
  const antes = linha.listar();
  assert.throws(() => linha.undo(), { message: "Edição pendente: confirme um checkpoint antes de navegar." });
  assert.throws(() => linha.redo());
  assert.deepEqual(linha.listar(), antes);
  assert.deepEqual(diario.ler(), estado("Pendente"));
  linha.confirmar("Pendente");
  assert.equal(linha.undo(), true);
});

test("nova edição confirmada após undo elimina ramificação futura, não antes da confirmação", () => {
  const diario = new Diario(estado("A"));
  const linha = new LinhaDoTempo(diario.portaMemorias(), 3);
  diario.substituir(estado("B")); linha.confirmar("B");
  diario.substituir(estado("C")); linha.confirmar("C");
  linha.undo();
  diario.substituir(estado("D"));
  assert.throws(() => linha.redo());
  assert.deepEqual(linha.listar().map((item) => item.rotulo), ["Inicial", "B", "C"]);
  linha.confirmar("D");
  assert.deepEqual(linha.listar().map((item) => item.rotulo), ["Inicial", "B", "D"]);
  assert.equal(linha.redo(), false);
  linha.undo(); assert.deepEqual(diario.ler(), estado("B"));
  linha.redo(); assert.deepEqual(diario.ler(), estado("D"));
});

test("limite inclui atual, poda mais antigo e reajusta cursor; limite um não permite undo", () => {
  const diario = new Diario(estado("A"));
  const linha = new LinhaDoTempo(diario.portaMemorias(), 2);
  diario.substituir(estado("B")); linha.confirmar("B");
  diario.substituir(estado("C")); linha.confirmar("C");
  assert.deepEqual(linha.listar(), [{ indice: 0, rotulo: "B", atual: false }, { indice: 1, rotulo: "C", atual: true }]);
  linha.undo();
  assert.deepEqual(diario.ler(), estado("B"));
  assert.equal(linha.undo(), false);
  const unico = new LinhaDoTempo(diario.portaMemorias(), 1);
  diario.substituir(estado("D")); unico.confirmar("D");
  assert.equal(unico.undo(), false);
  assert.equal(unico.redo(), false);
});

test("confirmar sem edição não duplica ponto; valores iguais escritos de novo ficam pendentes", () => {
  const diario = new Diario(estado("A"));
  const linha = new LinhaDoTempo(diario.portaMemorias());
  assert.equal(linha.confirmar("Sem edição"), false);
  assert.equal(linha.listar().length, 1);
  diario.substituir(estado("A"));
  assert.throws(() => linha.undo());
  assert.equal(linha.confirmar("Nova versão de A"), true);
  assert.equal(linha.listar().length, 2);
});

test("rótulo/limite inválidos e mutação de listagem não alteram cursor ou estado", () => {
  const diario = new Diario(estado("A"));
  const linha = new LinhaDoTempo(diario.portaMemorias());
  diario.substituir(estado("B"));
  assert.throws(() => linha.confirmar(" "));
  assert.deepEqual(diario.ler(), estado("B"));
  assert.equal(linha.listar().length, 1);
  for (const limite of [0, -1, 0.5, Infinity]) assert.throws(() => new LinhaDoTempo(diario.portaMemorias(), limite));
  const lista = linha.listar() as { indice: number; rotulo: string; atual: boolean }[];
  assert.equal(Reflect.set(lista[0]!, "atual", false), false);
  lista.pop();
  assert.equal(linha.listar()[0]!.atual, true);
});
