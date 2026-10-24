import assert from "node:assert/strict";
import { test } from "node:test";
import { Espada } from "../src/espada.js";
import { MantoDeCalor } from "../src/mantos.js";
import { MantoLimitador } from "./limitador.js";

test("limitar e adicionar calor não comutam", () => {
  const espada = new Espada(10);
  assert.deepEqual(new MantoLimitador(new MantoDeCalor(espada, 3), 11).executar(), {
    potencia: 11, efeitos: ["espada", "calor +3", "limite 11"],
  });
  assert.deepEqual(new MantoDeCalor(new MantoLimitador(espada, 11), 3).executar(), {
    potencia: 13, efeitos: ["espada", "limite 11", "calor +3"],
  });
  assert.equal(espada.executar().potencia, 10);
});

test("limite é local à camada e não corrige overflow ocorrido antes dela", () => {
  const ataqueInvalido = new MantoDeCalor(new Espada(Number.MAX_SAFE_INTEGER), 1);
  assert.throws(() => new MantoLimitador(ataqueInvalido, 11).executar(), { message: "Potência deve ser inteiro seguro maior ou igual a 0." });
  assert.equal(new MantoLimitador(new Espada(10), 0).executar().potencia, 0);
  assert.throws(() => new MantoLimitador(new Espada(), -1), { message: "Teto deve ser inteiro seguro maior ou igual a 0." });
});
