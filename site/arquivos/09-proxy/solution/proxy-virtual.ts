import type { ResultadoEntrada, Sala, Visitante } from "../src/contratos.js";

export class ProxyVirtual implements Sala {
  readonly #carregar: () => Sala;
  #sala: Sala | undefined;

  constructor(carregar: () => Sala) { this.#carregar = carregar; }

  entrar(visitante: Visitante): ResultadoEntrada {
    this.#sala ??= this.#carregar();
    return this.#sala.entrar(visitante);
  }
}
