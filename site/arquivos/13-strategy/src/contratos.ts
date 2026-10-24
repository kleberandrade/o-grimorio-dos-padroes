export interface Alvo {
  readonly nome: string;
  readonly distanciaMetros: number;
  readonly resistencia: "comum" | "reforcada";
}

export type ResultadoAtaque =
  | { readonly estado: "executado"; readonly tecnica: string; readonly alvo: string; readonly custo: number; readonly efeito: string }
  | { readonly estado: "inadequado"; readonly tecnica: string; readonly alvo: string; readonly custo: 0; readonly motivo: string };

export interface EstrategiaDeAtaque {
  atacar(alvo: Alvo): ResultadoAtaque;
}
