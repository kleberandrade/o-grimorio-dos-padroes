export interface ContextoUso { readonly nucleoMolhado: boolean; }

export type Ativacao =
  | { readonly estado: "ativa"; readonly custo: number; readonly efeito: string }
  | { readonly estado: "bloqueada"; readonly motivo: string };

// Implementor: a forma da arma não depende de uma essência concreta.
export interface Essencia {
  readonly nome: string;
  ativar(contexto: ContextoUso): Ativacao;
}

interface BaseResultado {
  readonly forma: string;
  readonly essencia: string;
  readonly custo: number;
  readonly efeitos: readonly string[];
}
export type ResultadoUso =
  | (BaseResultado & { readonly estado: "executado" })
  | (BaseResultado & { readonly estado: "bloqueado"; readonly motivo: string });
