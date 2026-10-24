import type { Comprovante, Correio, PedidoDeEnvio } from "./contratos.js";

// Simulador síncrono e local. Não envia mensagens pela rede.
export class CorreioEmMemoria implements Correio {
  #entregas: Comprovante[] = [];

  entregar(canal: string, pedido: PedidoDeEnvio): Comprovante {
    const comprovante = Object.freeze({
      id: this.#entregas.length + 1,
      canal,
      destino: pedido.destino,
      mensagem: pedido.mensagem,
    });
    this.#entregas.push(comprovante);
    return comprovante;
  }

  listarEntregas(): readonly Comprovante[] {
    return [...this.#entregas];
  }
}
