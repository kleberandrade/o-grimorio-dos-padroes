import { Cadeia } from "../src/cadeia.js";
import type { Pedido } from "../src/contratos.js";
import { Guarda, Conselheira, Regencia } from "../src/handlers.js";
import { PostoUrgente } from "./posto-urgente.js";

const pedido: Pedido = { tipo: "provisoes", solicitante: "Alda", prioridade: "urgente", quantidade: 8 };
for (const [rotulo, elos] of [
  ["Posto antes", [new Guarda(), new PostoUrgente(), new Conselheira(), new Regencia()]],
  ["Posto depois", [new Guarda(), new Conselheira(), new PostoUrgente(), new Regencia()]],
] as const) {
  const resultado = new Cadeia(elos).processar(pedido);
  console.log(`${rotulo}: ${resultado.status} | responsável: ${resultado.responsavel}`);
  console.log(`Percurso: ${resultado.percurso.map((passo) => passo.handler).join(" -> ")}`);
}
