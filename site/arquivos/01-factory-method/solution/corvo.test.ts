import assert from "node:assert/strict";
import { test } from "node:test";
import { avisarGuilda } from "../src/cliente.js";
import { CorreioEmMemoria } from "../src/correio-em-memoria.js";
import { CriadorDeCorvo } from "./corvo.js";

test("corvo amplia os canais preservando o cliente e a operação comum", () => {
  const correio = new CorreioEmMemoria();
  const pedido = { destino: " Ponte ", mensagem: " Alerta! " };
  const recibo = avisarGuilda(new CriadorDeCorvo(correio), pedido);
  assert.deepEqual(recibo, { id: 1, canal: "corvo", destino: "Ponte", mensagem: "Alerta!" });
  assert.deepEqual(correio.listarEntregas(), [recibo]);
});

test("corvo herda a rejeição de entrada inválida sem gerar entrega", () => {
  const correio = new CorreioEmMemoria();
  assert.throws(() => avisarGuilda(new CriadorDeCorvo(correio), { destino: "", mensagem: "Alerta!" }), { message: "Destino obrigatório." });
  assert.deepEqual(correio.listarEntregas(), []);
});
