import type { EntradaPermitida, PoliticaAcesso, ResultadoEntrada, Sala, Visitante } from "./contratos.js";
import { negarEntrada, normalizarVisitante } from "./politica.js";

// Alternativa: a verificação pertence ao próprio serviço, sem um real exposto.
export class SalaComControleProprio implements Sala {
  readonly #politica: PoliticaAcesso;
  #entradas: EntradaPermitida[] = [];

  constructor(politica: PoliticaAcesso) { this.#politica = politica; }

  entrar(visitante: Visitante): ResultadoEntrada {
    const normalizado = normalizarVisitante(visitante);
    const decisao = this.#politica(normalizado);
    if (!decisao.permitida) return negarEntrada(normalizado, decisao.motivo);
    const entrada: EntradaPermitida = Object.freeze({
      estado: "permitida", visitante: normalizado.nome, registro: this.#entradas.length + 1,
    });
    this.#entradas.push(entrada);
    return entrada;
  }

  listarEntradas(): readonly EntradaPermitida[] { return [...this.#entradas]; }
}
