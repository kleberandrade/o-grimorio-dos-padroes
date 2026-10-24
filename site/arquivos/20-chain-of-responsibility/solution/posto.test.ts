import assert from "node:assert/strict";
import { test } from "node:test";
import { Cadeia } from "../src/cadeia.js";
import type { Pedido } from "../src/contratos.js";
import { Guarda, Conselheira, Regencia } from "../src/handlers.js";
import { PostoUrgente } from "./posto-urgente.js";

const pedido: Pedido = { tipo: "provisoes", solicitante: "Alda", prioridade: "urgente", quantidade: 8 };

test("novo elo antes da decisão comum trata; depois da negativa terminal não é chamado", () => {
  const antes = new Cadeia([new Guarda(), new PostoUrgente(), new Conselheira(), new Regencia()]).processar(pedido);
  const depois = new Cadeia([new Guarda(), new Conselheira(), new PostoUrgente(), new Regencia()]).processar(pedido);
  assert.equal(antes.status, "tratado");
  assert.equal(antes.responsavel, "Posto urgente");
  assert.equal(depois.status, "negado");
  assert.equal(depois.responsavel, "Conselheira");
  assert.deepEqual(depois.percurso.map((passo) => passo.handler), ["Guarda", "Conselheira"]);
});

test("posto encaminha pedidos normais e excesso; limite extraordinário de dez é explícito", () => {
  const cadeia = new Cadeia([new PostoUrgente(), new Conselheira()]);
  assert.equal(cadeia.processar({ ...pedido, quantidade: 10 }).responsavel, "Posto urgente");
  assert.equal(cadeia.processar({ ...pedido, quantidade: 11 }).status, "negado");
  const normal = cadeia.processar({ ...pedido, prioridade: "normal" });
  assert.equal(normal.status, "negado");
  assert.equal(normal.responsavel, "Conselheira");
});

test("urgência não faz posto decidir passagem ou revogar interdição da galeria", () => {
  const cadeia = new Cadeia([new PostoUrgente(), new Guarda(), new Conselheira(), new Regencia()]);
  const passagem: Pedido = { tipo: "passagem", solicitante: "Alda", prioridade: "urgente", rota: "galeria-interna" };
  assert.equal(cadeia.processar(passagem).responsavel, "Regência");
  assert.equal(cadeia.processar(passagem).status, "negado");
  assert.equal(cadeia.processar({ ...passagem, rota: "porta-dos-carros" }).responsavel, "Guarda");
});
