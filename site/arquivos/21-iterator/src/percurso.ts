import type { IteradorOrdens, Ordem, PassoLocal } from "./contratos.js";
import { copiarOrdem } from "./contratos.js";

export class PercursoSnapshot implements IteradorOrdens {
  readonly #ordens: readonly Ordem[];
  #indice = 0;
  constructor(ordens: readonly Ordem[]) { this.#ordens = Object.freeze(ordens.map(copiarOrdem)); }
  proximo(): PassoLocal {
    if (this.#indice >= this.#ordens.length) return Object.freeze({ fim: true });
    const ordem = this.#ordens[this.#indice]!;
    this.#indice += 1;
    return Object.freeze({ fim: false, ordem });
  }
}
