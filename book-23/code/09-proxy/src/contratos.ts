export interface Visitante {
  readonly nome: string;
  readonly mandatoValido: boolean;
}

export interface EntradaPermitida {
  readonly estado: "permitida";
  readonly visitante: string;
  readonly registro: number;
}

export interface EntradaNegada {
  readonly estado: "negada";
  readonly visitante: string;
  readonly motivo: string;
}

export type ResultadoEntrada = EntradaPermitida | EntradaNegada;
export interface Sala { entrar(visitante: Visitante): ResultadoEntrada; }

export interface DecisaoAcesso {
  readonly permitida: boolean;
  readonly motivo: string;
}
export type PoliticaAcesso = (visitante: Visitante) => DecisaoAcesso;
