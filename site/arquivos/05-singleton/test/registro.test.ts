import assert from "node:assert/strict";
import { test } from "node:test";
import { montarCasaDeControle } from "../src/composicao.js";
import type { OrdemDeComporta, Registro } from "../src/contratos.js";
import { observarOutroContexto } from "../src/contextos.js";
import { EquipeDeComportas } from "../src/equipe.js";
import { obterRegistroCompartilhado } from "../src/modulo-compartilhado.js";
import { criarExemploDePreferenciaGlobal } from "../src/preferencia-compartilhada.js";
import { RegistroEmMemoria } from "../src/registro.js";

test("a API devolve a mesma identidade na mesma avaliação de módulo", async () => {
  const outroImport = await import("../src/modulo-compartilhado.js");
  assert.equal(obterRegistroCompartilhado(), outroImport.obterRegistroCompartilhado());
});

test("o serviço usa um Registro substituto recebido, sem buscar singleton escondido", () => {
  const ordens: OrdemDeComporta[] = [];
  const registro: Registro = { registrar: (ordem) => { ordens.push(ordem); }, listarOrdens: () => [...ordens] };
  const equipe = new EquipeDeComportas(registro, " Sul ", "dia");
  const emitida = equipe.emitirOrdem(" Leste ", "fechar");
  assert.deepEqual(ordens, [{ equipe: "Sul", comporta: "Leste", acao: "fechar", turno: "dia" }]);
  assert.deepEqual(emitida, ordens[0]);
});

test("serviços distintos compartilham o registro escolhido pela composição", () => {
  const registro = new RegistroEmMemoria();
  const casa = montarCasaDeControle(registro);
  casa.equipeSul.emitirOrdem("Leste", "fechar");
  casa.equipeNorte.emitirOrdem("Oeste", "abrir");
  assert.equal(casa.registro, registro);
  assert.deepEqual(registro.listarOrdens().map((ordem) => ordem.equipe), ["Sul", "Norte"]);
});

test("as preferências de uma equipe não afetam a outra nem as ordens anteriores", () => {
  const casa = montarCasaDeControle(new RegistroEmMemoria());
  const primeira = casa.equipeSul.emitirOrdem("Leste", "abrir");
  casa.equipeSul.definirTurno("noite");
  const sul = casa.equipeSul.emitirOrdem("Leste", "fechar");
  const norte = casa.equipeNorte.emitirOrdem("Oeste", "abrir");
  assert.equal(primeira.turno, "dia");
  assert.equal(sul.turno, "noite");
  assert.equal(norte.turno, "dia");
});

test("compartilhar o objeto de preferências contamina as duas referências", () => {
  const exemplo = criarExemploDePreferenciaGlobal();
  assert.equal(exemplo.sul, exemplo.norte);
  exemplo.sul.turno = "noite";
  assert.equal(exemplo.norte.turno, "noite");
});

test("novas instâncias isolam o estado sem reset global", () => {
  const primeira = montarCasaDeControle(new RegistroEmMemoria());
  const segunda = montarCasaDeControle(new RegistroEmMemoria());
  primeira.equipeSul.emitirOrdem("Leste", "fechar");
  assert.equal(primeira.registro.listarOrdens().length, 1);
  assert.deepEqual(segunda.registro.listarOrdens(), []);
});

test("cópias da entrada e da lista consultada protegem o histórico", () => {
  const registro = new RegistroEmMemoria();
  const ordem: { equipe: string; comporta: string; acao: "abrir"; turno: "dia" } = {
    equipe: "Sul", comporta: "Leste", acao: "abrir", turno: "dia",
  };
  registro.registrar(ordem);
  ordem.equipe = "Alterada";
  const consulta = registro.listarOrdens() as OrdemDeComporta[];
  const item = consulta[0];
  assert.ok(item);
  assert.equal(Reflect.set(item, "equipe", "Alterada"), false);
  consulta.pop();
  assert.deepEqual(registro.listarOrdens(), [{ equipe: "Sul", comporta: "Leste", acao: "abrir", turno: "dia" }]);
});

test("ordem inválida não gera registro e equipe vazia não cria serviço", () => {
  const registro = new RegistroEmMemoria();
  const equipe = new EquipeDeComportas(registro, "Sul", "dia");
  assert.throws(() => equipe.emitirOrdem(" ", "abrir"), { message: "Comporta obrigatória." });
  assert.throws(() => registro.registrar({ equipe: " ", comporta: "Leste", acao: "abrir", turno: "dia" }), { message: "Equipe e comporta são obrigatórias." });
  assert.throws(() => new EquipeDeComportas(registro, " ", "dia"), { message: "Nome da equipe obrigatório." });
  assert.deepEqual(registro.listarOrdens(), []);
});

test("falha do registro é propagada sem retornar ordem como registrada", () => {
  const falha = new Error("Registro indisponível.");
  const registro: Registro = { registrar: () => { throw falha; }, listarOrdens: () => [] };
  assert.throws(() => new EquipeDeComportas(registro, "Sul", "dia").emitirOrdem("Leste", "abrir"), (erro: unknown) => erro === falha);
});

test("dois Workers têm registros próprios; nada é adicionado ao contexto pai", async () => {
  const registroPai = obterRegistroCompartilhado();
  const antes = registroPai.listarOrdens();
  const [primeiro, segundo] = await Promise.all([observarOutroContexto(), observarOutroContexto()]);
  assert.deepEqual(primeiro, { antes: 0, depois: 1, mesmaIdentidade: true });
  assert.deepEqual(segundo, primeiro);
  assert.deepEqual(registroPai.listarOrdens(), antes);
});
