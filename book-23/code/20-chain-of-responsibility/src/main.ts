import { Cadeia } from "./cadeia.js";
import type { Pedido } from "./contratos.js";
import { Guarda, Conselheira, Regencia } from "./handlers.js";

const guarda = new Guarda();
const alternativa: Pedido = { tipo: "passagem", solicitante: "Alda", prioridade: "urgente", rota: "porta-dos-carros" };
console.log(`Responsável conhecido, chamada direta: ${guarda.decidir(alternativa).status}`);
const cadeia = new Cadeia([guarda, new Conselheira(), new Regencia()]);
const pedidos: Pedido[] = [
  { tipo: "passagem", solicitante: "Alda", prioridade: "urgente", rota: "galeria-interna" },
  alternativa,
  { tipo: "audiencia", solicitante: "Alda", prioridade: "normal", assunto: "Reparos no posto" },
];
for (const pedido of pedidos) {
  const resultado = cadeia.processar(pedido);
  console.log(`${pedido.tipo}: ${resultado.status} | responsável: ${resultado.responsavel ?? "nenhum"}`);
  console.log(`Percurso: ${resultado.percurso.map((passo) => `${passo.handler}=${passo.decisao}`).join(" -> ")}`);
  console.log(resultado.motivo);
}
