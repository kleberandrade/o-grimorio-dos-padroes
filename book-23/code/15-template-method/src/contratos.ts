export type Etapa = "prepararIngredientes" | "conjurarEncantamento" | "selar";
export interface Encantamento {
  readonly elemento: "fogo" | "gelo";
  readonly efeito: "aquecimento modelado" | "resfriamento modelado";
}
export interface Lote {
  readonly ingredientesPreparados: readonly string[] | null;
  readonly encantamento: Encantamento | null;
  readonly selo: string | null;
}
export type ResultadoRitual = Readonly<{
  status: "concluido"; lote: Lote; etapasConcluidas: readonly Etapa[];
}> | Readonly<{
  status: "falhou"; lote: Lote; etapasConcluidas: readonly Etapa[];
  etapaFalha: Etapa; motivo: string;
}>;

export function preparar(ingredientes: readonly string[]): readonly string[] {
  if (ingredientes.length === 0) throw new Error("O lote requer ingredientes.");
  const copia = ingredientes.map((item) => item.trim());
  if (copia.some((item) => item.length === 0)) throw new Error("Ingrediente sem nome.");
  return Object.freeze(copia);
}

export function copiarEncantamento(valor: Encantamento): Encantamento {
  return Object.freeze({ elemento: valor.elemento, efeito: valor.efeito });
}

export function snapshot(ingredientes: readonly string[] | null, encantamento: Encantamento | null,
  selo: string | null): Lote {
  return Object.freeze({ ingredientesPreparados: ingredientes === null ? null : Object.freeze([...ingredientes]),
    encantamento: encantamento === null ? null : copiarEncantamento(encantamento), selo });
}

export function mensagem(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Falha sem mensagem de Error.";
}
