import type { EventoOrdem, Unidade } from "./contratos.js";

// Alternativa simples para unidades sem uma relação parte-todo.
export function executarListaPlana(unidades: readonly Unidade[], ordem: string): readonly EventoOrdem[] {
  return Object.freeze(unidades.flatMap((unidade) => unidade.executarOrdem(ordem)));
}
