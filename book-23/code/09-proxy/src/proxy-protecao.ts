import type { PoliticaAcesso, ResultadoEntrada, Sala, Visitante } from "./contratos.js";
import { negarEntrada, normalizarVisitante } from "./politica.js";

export class ProxyDeProtecao implements Sala {
  readonly #sala: Sala;
  readonly #politica: PoliticaAcesso;

  constructor(sala: Sala, politica: PoliticaAcesso) {
    this.#sala = sala;
    this.#politica = politica;
  }

  entrar(visitante: Visitante): ResultadoEntrada {
    const normalizado = normalizarVisitante(visitante);
    const decisao = this.#politica(normalizado);
    if (!decisao.permitida) return negarEntrada(normalizado, decisao.motivo);
    return this.#sala.entrar(normalizado);
  }
}
