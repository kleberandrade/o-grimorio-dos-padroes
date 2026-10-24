import assert from "node:assert/strict";
import { test } from "node:test";
import { Diario } from "../src/diario.js";
import type { Memoria } from "../src/diario.js";
import { GuardiaoDasMemorias } from "../src/guardiao.js";

const estado = (conteudo: string) => ({ conteudo, contexto: { local: "Chronoria", marcadores: ["testemunho", "norte"] } });

test("restaurar recupera exatamente conteúdo, campo aninhado e lista, perdendo edições posteriores", () => {
  const inicial = estado("Declaração original.");
  const diario = new Diario(inicial);
  const token = diario.salvar();
  diario.substituir({ conteudo: "Edição posterior.", contexto: { local: "Outro local", marcadores: ["pessoal"] } });
  const copiaSeparada = diario.ler();
  diario.restaurar(token);
  assert.deepEqual(diario.ler(), inicial);
  assert.equal(copiaSeparada.conteudo, "Edição posterior.");
  assert.notDeepEqual(diario.ler(), copiaSeparada);
});

test("entrada é copiada; restaurar, editar e restaurar o MESMO token preserva a captura", () => {
  const entrada = estado("Original");
  const diario = new Diario(entrada);
  const token = diario.salvar();
  entrada.conteudo = "Mutado fora";
  entrada.contexto.local = "Fora";
  entrada.contexto.marcadores.push("intruso");
  assert.deepEqual(diario.ler(), estado("Original"));
  diario.substituir(estado("Primeira edição"));
  diario.restaurar(token);
  diario.substituir({ conteudo: "Segunda edição", contexto: { local: "Alterado", marcadores: ["novo"] } });
  diario.restaurar(token);
  assert.deepEqual(diario.ler(), estado("Original"));
});

test("visões públicas congeladas não alteram estado ativo ou captura", () => {
  const diario = new Diario(estado("Original"));
  const token = diario.salvar();
  const visao = diario.ler();
  assert.equal(Reflect.set(visao, "conteudo", "Alterado"), false);
  assert.equal(Reflect.set(visao.contexto, "local", "Alterado"), false);
  assert.equal(Reflect.set(visao.contexto.marcadores, "0", "Alterado"), false);
  diario.restaurar(token);
  const segunda = diario.ler();
  assert.notEqual(visao, segunda);
  assert.notEqual(visao.contexto, segunda.contexto);
  assert.notEqual(visao.contexto.marcadores, segunda.contexto.marcadores);
  assert.deepEqual(segunda, estado("Original"));
});

test("token é opaco em execução: sem campos, símbolos, protótipo ou getter de estado", () => {
  const diario = new Diario(estado("Segredo não deve estar no token."));
  const token = diario.salvar();
  assert.deepEqual(Reflect.ownKeys(token), []);
  assert.deepEqual(Object.getOwnPropertyDescriptors(token), {});
  assert.equal(Object.getPrototypeOf(token), null);
  assert.equal(Object.isFrozen(token), true);
  assert.equal("getEstado" in token, false);
  assert.equal(JSON.stringify(token), "{}");
  assert.equal(Reflect.set(token, "estado", "roubado"), false);
});

test("tokens de outro diário, copiados, falsificados e serializados são recusados sem mudança", () => {
  const diario = new Diario(estado("Ativo"));
  const legitimo = diario.salvar();
  const outro = new Diario(estado("Outro")).salvar();
  const copiado = Object.freeze(Object.assign(Object.create(null), legitimo)) as Memoria;
  const falsificado = { rotulo: "Depoimento inicial" } as unknown as Memoria;
  const serializado = JSON.parse(JSON.stringify(legitimo)) as Memoria;
  const antes = diario.ler();
  for (const token of [outro, copiado, falsificado, serializado]) {
    assert.throws(() => diario.restaurar(token), { message: "Memória inválida para este diário." });
    assert.throws(() => diario.correspondeCheckpoint(token));
    assert.deepEqual(diario.ler(), antes);
  }
});

test("guardião só guarda tokens e rótulos mínimos; limite poda mais antigo sem restaurar", () => {
  const diario = new Diario(estado("A"));
  const guardiao = new GuardiaoDasMemorias(2);
  const antigo = diario.salvar();
  guardiao.adicionar(antigo, " A ");
  diario.substituir(estado("B"));
  const segundo = diario.salvar();
  guardiao.adicionar(segundo, "B");
  diario.substituir(estado("C"));
  guardiao.adicionar(diario.salvar(), "C");
  assert.deepEqual(guardiao.listar(), [{ indice: 0, rotulo: "B" }, { indice: 1, rotulo: "C" }]);
  assert.equal(guardiao.obter(0), segundo);
  assert.equal(diario.ler().conteudo, "C");
  diario.restaurar(antigo); // Referência externa retida não foi revogada pela poda.
  assert.equal(diario.ler().conteudo, "A");
});

test("índices, limites e rótulos inválidos são recusados; listagem não altera histórico", () => {
  const diario = new Diario(estado("A"));
  const guardiao = new GuardiaoDasMemorias(1);
  assert.throws(() => guardiao.obter(0));
  assert.throws(() => guardiao.adicionar(diario.salvar(), " "));
  guardiao.adicionar(diario.salvar(), "A");
  for (const indice of [-1, 0.5, NaN, Infinity, 1]) assert.throws(() => guardiao.obter(indice));
  for (const limite of [0, -1, 0.5, NaN, Infinity]) assert.throws(() => new GuardiaoDasMemorias(limite));
  const lista = guardiao.listar() as { indice: number; rotulo: string }[];
  assert.equal(Reflect.set(lista[0]!, "rotulo", "Alterado"), false);
  lista.pop();
  assert.equal(guardiao.listar().length, 1);
  assert.equal(diario.ler().conteudo, "A");
});

test("porta é wrapper real sem métodos de leitura/edição do diário, não só um cast estático", () => {
  const diario = new Diario(estado("A"));
  const porta = diario.portaMemorias();
  assert.notEqual(porta, diario);
  assert.deepEqual(Reflect.ownKeys(porta).sort(), ["correspondeCheckpoint", "restaurar", "salvar"]);
  assert.equal("ler" in porta, false);
  assert.equal("substituir" in porta, false);
  const salvarExtraido = porta.salvar;
  const token = salvarExtraido();
  diario.substituir(estado("B"));
  porta.restaurar(token);
  assert.equal(diario.ler().conteudo, "A");
});

test("marca do checkpoint distingue nova edição com valores iguais de igualdade profunda", () => {
  const diario = new Diario(estado("A"));
  const token = diario.salvar();
  assert.equal(diario.correspondeCheckpoint(token), true);
  diario.substituir(estado("A"));
  assert.deepEqual(diario.ler(), estado("A"));
  assert.equal(diario.correspondeCheckpoint(token), false);
  diario.restaurar(token);
  assert.equal(diario.correspondeCheckpoint(token), true);
});
