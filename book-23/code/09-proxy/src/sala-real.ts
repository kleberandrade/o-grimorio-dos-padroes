import type { EntradaPermitida, Sala, Visitante } from "./contratos.js";
import { normalizarVisitante } from "./politica.js";

export class SalaReal implements Sala {
  #entradas: EntradaPermitida[] = [];

  entrar(visitante: Visitante): EntradaPermitida {
    const normalizado = normalizarVisitante(visitante);
    const entrada: EntradaPermitida = Object.freeze({
      estado: "permitida", visitante: normalizado.nome, registro: this.#entradas.length + 1,
    });
    this.#entradas.push(entrada);
    return entrada;
  }

  listarEntradas(): readonly EntradaPermitida[] {
    return [...this.#entradas];
  }
}
