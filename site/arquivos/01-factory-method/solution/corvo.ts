import type { Comprovante, Correio, Mensageiro, PedidoDeEnvio } from "../src/contratos.js";
import { CriadorDeNotificacoes } from "../src/criadores.js";

export class MensageiroDeCorvo implements Mensageiro {
  constructor(private readonly correio: Correio) {}

  entregar(pedido: PedidoDeEnvio): Comprovante {
    return this.correio.entregar("corvo", pedido);
  }
}

export class CriadorDeCorvo extends CriadorDeNotificacoes {
  protected override criarMensageiro(): Mensageiro {
    return new MensageiroDeCorvo(this.correio);
  }
}
