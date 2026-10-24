import type { Handler, Passo, Pedido, Resultado } from "./contratos.js";
import { normalizarPedido, texto } from "./contratos.js";

export class Cadeia {
  readonly #elos: readonly Handler[];
  #processando = false;

  constructor(handlers: readonly Handler[]) {
    if (new Set(handlers).size !== handlers.length) throw new Error("Mesmo handler não pode aparecer duas vezes.");
    this.#elos = Object.freeze(handlers.map((handler) => Object.freeze({
      nome: texto(handler.nome), decidir: handler.decidir.bind(handler),
    })));
  }

  processar(entrada: Pedido): Resultado {
    if (this.#processando) throw new Error("Reentrância recusada nesta cadeia.");
    const pedido = normalizarPedido(entrada);
    const percurso: Passo[] = [];
    this.#processando = true;
    try {
      for (const elo of this.#elos) {
        const resposta = elo.decidir(pedido);
        if (!["tratado", "negado", "naoTratado"].includes(resposta.status)) throw new Error("Status inválido devolvido pelo handler.");
        const motivo = texto(resposta.motivo);
        percurso.push(Object.freeze({ handler: elo.nome, decisao: resposta.status }));
        if (resposta.status !== "naoTratado") {
          return Object.freeze({ status: resposta.status, motivo, responsavel: elo.nome, percurso: Object.freeze(percurso) });
        }
      }
      return Object.freeze({ status: "naoTratado", motivo: "Nenhum elo responsável nesta cadeia.", responsavel: null,
        percurso: Object.freeze(percurso) });
    } finally { this.#processando = false; }
  }
}
