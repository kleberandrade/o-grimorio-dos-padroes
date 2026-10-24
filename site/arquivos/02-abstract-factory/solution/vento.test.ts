import assert from "node:assert/strict";
import { test } from "node:test";
import { ArmaDeBrasa } from "../src/brasa.js";
import { ensaiarKit } from "../src/cliente.js";
import { FabricaDeVento, ProtecaoDeVento } from "./vento.js";

test("a terceira família coopera com o cliente existente sem alterar seus contratos", () => {
  assert.deepEqual(ensaiarKit(new FabricaDeVento(), 3), {
    afinidade: "vento",
    arma: "Lâmina de vento",
    protecao: "Escudo de vento",
    intensidade: 3,
  });
});

test("a terceira família mantém a rejeição de mistura e intensidade inválida", () => {
  assert.throws(() => new ProtecaoDeVento().ensaiar(new ArmaDeBrasa().emitirPulso(3)), {
    message: "Afinidades incompatíveis: brasa / vento.",
  });
  assert.throws(() => ensaiarKit(new FabricaDeVento(), 0), {
    message: "Intensidade deve ser positiva e finita.",
  });
});
