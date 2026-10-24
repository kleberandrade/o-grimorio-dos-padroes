import type { Decisao, Handler, Pedido } from "../src/contratos.js";
import { decisao } from "../src/contratos.js";

export class PostoUrgente implements Handler {
  readonly nome = "Posto urgente";
  constructor() { Object.freeze(this); }
  decidir(pedido: Pedido): Decisao {
    if (pedido.tipo === "provisoes" && pedido.prioridade === "urgente" && pedido.quantidade <= 10) {
      return decisao("tratado", "Reserva extraordinária local para provisões urgentes até dez unidades.");
    }
    return decisao("naoTratado", "Fora da atribuição extraordinária deste posto.");
  }
}
