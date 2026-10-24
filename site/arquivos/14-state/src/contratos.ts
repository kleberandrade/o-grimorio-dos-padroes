export interface CondicaoDescanso { readonly protegido: boolean; }

export interface Transicao {
  readonly proximo: Estado;
  readonly executada: boolean;
  readonly efeito: string;
}

export interface Estado {
  readonly nome: string;
  readonly intervalosFuria: number;
  atacar(): Transicao;
  descansar(condicao: CondicaoDescanso): Transicao;
}

export interface RegistroAcao {
  readonly acao: "atacar" | "descansar";
  readonly executada: boolean;
  readonly antes: string;
  readonly depois: string;
  readonly intervalosFuriaRestantes: number;
  readonly efeito: string;
}

export function transicao(proximo: Estado, executada: boolean, efeito: string): Transicao {
  return Object.freeze({ proximo, executada, efeito });
}
