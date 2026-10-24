import type { Decisao, Handler, Pedido } from "./contratos.js";
import { decisao } from "./contratos.js";

export class Guarda implements Handler {
  readonly nome = "Guarda";
  constructor() { Object.freeze(this); }
  decidir(pedido: Pedido): Decisao {
    if (pedido.tipo === "passagem" && pedido.rota === "porta-dos-carros") {
      return decisao("tratado", "Passagem pela Porta dos Carros autorizada no modelo.");
    }
    return decisao("naoTratado", "Pedido fora da atribuição da guarda.");
  }
}

export class Conselheira implements Handler {
  readonly nome = "Conselheira";
  constructor() { Object.freeze(this); }
  decidir(pedido: Pedido): Decisao {
    if (pedido.tipo !== "provisoes") return decisao("naoTratado", "Pedido não é de provisões.");
    return pedido.quantidade <= 5
      ? decisao("tratado", "Provisões dentro da cota local de cinco unidades.")
      : decisao("negado", "Quantidade excede a cota local de cinco unidades.");
  }
}

export class Regencia implements Handler {
  readonly nome = "Regência";
  constructor() { Object.freeze(this); }
  decidir(pedido: Pedido): Decisao {
    if (pedido.tipo === "passagem" && pedido.rota === "galeria-interna") {
      return decisao("negado", "Galeria interna interditada; requer outro pedido para rota alternativa.");
    }
    return decisao("naoTratado", "Pedido fora da atribuição desta regência.");
  }
}
