import assert from "node:assert/strict";
import { test } from "node:test";
import type { Estado, RegistroAcao } from "../src/contratos.js";
import { EstadoExausto, EstadoFurioso, EstadoNormal } from "../src/estados.js";
import { Guerreiro } from "../src/guerreiro.js";
import { avancarTabela } from "../src/tabela.js";
import type { EstadoTabela } from "../src/tabela.js";

test("ciclo padrão: golpe normal inicia dois intervalos, consumidos por dois golpes furiosos", () => {
  const guerreiro = new Guerreiro("Dário");
  assert.deepEqual(guerreiro.situacao(), { estado: "normal", intervalosFuria: 0 });
  const primeiro = guerreiro.atacar();
  const segundo = guerreiro.atacar();
  const terceiro = guerreiro.atacar();
  assert.deepEqual([primeiro, segundo, terceiro].map((item) => [item.executada, item.antes, item.depois, item.intervalosFuriaRestantes]), [
    [true, "normal", "furioso", 2], [true, "furioso", "furioso", 1], [true, "furioso", "exausto", 0],
  ]);
});

test("exaustão recusa ataques repetidos sem registrar sucesso ou alterar estado", () => {
  const guerreiro = new Guerreiro("Dário", new EstadoExausto());
  const primeira = guerreiro.atacar();
  const segunda = guerreiro.atacar();
  assert.equal(primeira.executada, false);
  assert.equal(segunda.executada, false);
  assert.deepEqual(guerreiro.situacao(), { estado: "exausto", intervalosFuria: 0 });
  assert.equal(guerreiro.listarHistorico().filter((item) => item.executada).length, 0);
});

test("descanso protegido completo recupera exausto, sem proteção não recupera", () => {
  const guerreiro = new Guerreiro("Dário", new EstadoExausto());
  assert.equal(guerreiro.descansar({ protegido: false }).executada, false);
  assert.equal(guerreiro.situacao().estado, "exausto");
  assert.equal(guerreiro.descansar({ protegido: true }).executada, true);
  assert.deepEqual(guerreiro.situacao(), { estado: "normal", intervalosFuria: 0 });
  assert.equal(guerreiro.atacar().intervalosFuriaRestantes, 2);
});

test("tentar descansar em fúria não consome os intervalos nem muda o estado", () => {
  const guerreiro = new Guerreiro("Dário");
  guerreiro.atacar();
  for (const protegido of [false, true]) {
    assert.equal(guerreiro.descansar({ protegido }).executada, false);
    assert.deepEqual(guerreiro.situacao(), { estado: "furioso", intervalosFuria: 2 });
  }
  assert.equal(guerreiro.atacar().intervalosFuriaRestantes, 1);
});

test("normal descansa com proteção sem entrar em fúria; sem proteção recusa", () => {
  const guerreiro = new Guerreiro("Dário");
  assert.equal(guerreiro.descansar({ protegido: true }).executada, true);
  assert.equal(guerreiro.descansar({ protegido: false }).executada, false);
  assert.deepEqual(guerreiro.situacao(), { estado: "normal", intervalosFuria: 0 });
});

test("dois contextos podem receber o mesmo EstadoFurioso imutável sem dividir contador mutável", () => {
  const inicial = new EstadoFurioso(2);
  const primeiro = new Guerreiro("Dário", inicial);
  const segundo = new Guerreiro("Outra guarda", inicial);
  primeiro.atacar();
  assert.deepEqual(primeiro.situacao(), { estado: "furioso", intervalosFuria: 1 });
  assert.deepEqual(segundo.situacao(), { estado: "furioso", intervalosFuria: 2 });
  assert.equal(inicial.intervalosFuria, 2);
  assert.equal(Object.isFrozen(inicial), true);
});

test("snapshot e histórico não expõem mutação, e não existe setEstado público", () => {
  const guerreiro = new Guerreiro(" Dário ");
  assert.equal(guerreiro.nome, "Dário");
  assert.equal("setEstado" in guerreiro, false);
  assert.equal("aplicar" in guerreiro, false);
  const primeiro = guerreiro.atacar();
  assert.equal(Reflect.set(primeiro, "executada", false), false);
  assert.equal(Reflect.set(guerreiro.situacao(), "estado", "normal"), false);
  const lista = guerreiro.listarHistorico() as RegistroAcao[];
  lista.pop();
  assert.equal(guerreiro.listarHistorico().length, 1);
  guerreiro.atacar();
  assert.equal(primeiro.intervalosFuriaRestantes, 2);
});

test("erro de estado externo é propagado sem registrar ação ou mudar o estado interno", () => {
  const falha = new Error("Estado externo falhou.");
  const estado: Estado = { nome: "externo", intervalosFuria: 0,
    atacar: () => { throw falha; }, descansar: () => { throw falha; } };
  const guerreiro = new Guerreiro("Dário", estado);
  assert.throws(() => guerreiro.atacar(), (erro: unknown) => erro === falha);
  assert.deepEqual(guerreiro.listarHistorico(), []);
  assert.equal(guerreiro.situacao().estado, "externo");
});

test("alternativa de tabela reproduz todas as ações dos estados fornecidos", () => {
  const estados: [EstadoTabela, Estado][] = [
    ["normal", new EstadoNormal()], ["furioso-2", new EstadoFurioso(2)],
    ["furioso-1", new EstadoFurioso(1)], ["exausto", new EstadoExausto()],
  ];
  for (const [nome, estado] of estados) {
    for (const acao of ["atacar", "descansar"] as const) {
      for (const protegido of [false, true]) {
        const guerreiro = new Guerreiro("Dário", estado);
        const registro = acao === "atacar" ? guerreiro.atacar() : guerreiro.descansar({ protegido });
        const tabela = avancarTabela(nome, acao, protegido);
        const situacao = guerreiro.situacao();
        const depois = situacao.estado === "furioso" ? `furioso-${situacao.intervalosFuria}` : situacao.estado;
        assert.equal(tabela.estado, depois);
        assert.equal(tabela.executada, registro.executada);
      }
    }
  }
});

test("nome vazio é recusado", () => {
  assert.throws(() => new Guerreiro(" "), { message: "Nome obrigatório." });
});
