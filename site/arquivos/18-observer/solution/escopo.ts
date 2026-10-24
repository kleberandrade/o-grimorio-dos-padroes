import { Oraculo } from "../src/oraculo.js";
import type { Desligar, Observador } from "../src/oraculo.js";

export class EscopoDeInscricoes {
  #encerrado = false;
  readonly #desligamentos: Desligar[] = [];

  inscrever(oraculo: Oraculo, nome: string, observar: Observador): Desligar {
    if (this.#encerrado) throw new Error("Escopo já encerrado.");
    const desligar = oraculo.inscrever(nome, observar);
    this.#desligamentos.push(desligar);
    return desligar;
  }

  encerrar(): number {
    if (this.#encerrado) return 0;
    this.#encerrado = true;
    const desligamentos = this.#desligamentos.splice(0);
    return desligamentos.reduce((total, desligar) => total + (desligar() ? 1 : 0), 0);
  }
}
