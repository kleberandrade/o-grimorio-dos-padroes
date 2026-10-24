import assert from "node:assert/strict";
import { test } from "node:test";
import { Guerreiro } from "../src/guerreiro.js";
import { EstadoDefensivo } from "./defensivo.js";

test("estado defensivo inicial faz contra-ataque e retoma o ciclo normal sem alterar outros estados", () => {
  const guerreiro = new Guerreiro("Dário", new EstadoDefensivo());
  assert.equal(guerreiro.atacar().depois, "normal");
  assert.deepEqual(guerreiro.situacao(), { estado: "normal", intervalosFuria: 0 });
  assert.equal(guerreiro.atacar().intervalosFuriaRestantes, 2);
  assert.equal(guerreiro.atacar().intervalosFuriaRestantes, 1);
  assert.equal(guerreiro.atacar().depois, "exausto");
});

test("defensivo mantém guarda sem proteção e pode encerrar com descanso protegido completo", () => {
  const guerreiro = new Guerreiro("Dário", new EstadoDefensivo());
  assert.equal(guerreiro.descansar({ protegido: false }).executada, false);
  assert.equal(guerreiro.situacao().estado, "defensivo");
  assert.equal(guerreiro.descansar({ protegido: true }).depois, "normal");
});
