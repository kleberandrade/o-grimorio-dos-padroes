export interface Ingrediente {
  nome: string;
  dose: { quantidade: number; unidade: "gotas" | "gramas" };
  observacoes: string[];
}

export interface PocaoPrototype {
  readonly lote: string;
  readonly selo: SeloDeProcedencia;
  clone(novoLote: string): PocaoPrototype;
  ajustarQuantidade(nome: string, quantidade: number): void;
  anotarIngrediente(nome: string, nota: string): void;
  adicionarIngrediente(ingrediente: Ingrediente): void;
  consultarIngredientes(): Ingrediente[];
  descrever(): string;
}
import type { SeloDeProcedencia } from "./selo.js";

