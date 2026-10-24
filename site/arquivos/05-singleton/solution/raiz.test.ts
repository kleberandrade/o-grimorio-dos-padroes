import assert from "node:assert/strict";
import { test } from "node:test";
import { RegistroEmMemoria } from "../src/registro.js";
import { iniciarCasa } from "./raiz.js";

test("a raiz preserva ciclo singleton padrão sem escondê-lo nos serviços", () => {
  assert.equal(iniciarCasa().registro, iniciarCasa().registro);
});

test("a raiz permite substituir a dependência e isolar dados por instância", () => {
  const primeira = iniciarCasa(new RegistroEmMemoria());
  const segunda = iniciarCasa(new RegistroEmMemoria());
  primeira.equipeNorte.emitirOrdem("Oeste", "abrir");
  assert.equal(primeira.registro.listarOrdens().length, 1);
  assert.deepEqual(segunda.registro.listarOrdens(), []);
  assert.notEqual(primeira.registro, segunda.registro);
});
