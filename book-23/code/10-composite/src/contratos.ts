export interface EventoOrdem {
  readonly tipo: "formacao" | "soldado";
  readonly nome: string;
  readonly ordem: string;
}

export interface Unidade {
  executarOrdem(ordem: string): readonly EventoOrdem[];
}
