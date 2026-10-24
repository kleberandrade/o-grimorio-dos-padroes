import type { Comprovante, Correio, Mensageiro, PedidoDeEnvio } from "./contratos.js";

export class MensageiroDeCristal implements Mensageiro {
  constructor(private readonly correio: Correio) {}

  entregar(pedido: PedidoDeEnvio): Comprovante {
    return this.correio.entregar("cristal", pedido);
  }
}

export class MensageiroDePergaminho implements Mensageiro {
  constructor(private readonly correio: Correio) {}

  entregar(pedido: PedidoDeEnvio): Comprovante {
    return this.correio.entregar("pergaminho", pedido);
  }
}
