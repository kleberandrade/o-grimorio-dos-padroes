import type { Comprovante, Correio, Mensageiro, PedidoDeEnvio } from "./contratos.js";
import { MensageiroDeCristal, MensageiroDePergaminho } from "./mensageiros.js";

// Creator: a operação comum usa o produto devolvido pelo Factory Method.
export abstract class CriadorDeNotificacoes {
  constructor(protected readonly correio: Correio) {}

  protected abstract criarMensageiro(): Mensageiro;

  enviar(pedido: PedidoDeEnvio): Comprovante {
    const destino = pedido.destino.trim();
    const mensagem = pedido.mensagem.trim();
    if (destino.length === 0) throw new Error("Destino obrigatório.");
    if (mensagem.length === 0) throw new Error("Mensagem obrigatória.");

    const mensageiro = this.criarMensageiro();
    return mensageiro.entregar({ destino, mensagem });
  }
}

export class CriadorDeCristal extends CriadorDeNotificacoes {
  protected override criarMensageiro(): Mensageiro {
    return new MensageiroDeCristal(this.correio);
  }
}

export class CriadorDePergaminho extends CriadorDeNotificacoes {
  protected override criarMensageiro(): Mensageiro {
    return new MensageiroDePergaminho(this.correio);
  }
}
