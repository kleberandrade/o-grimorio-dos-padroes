import type { PocaoPrototype } from "./contratos.js";

export function personalizarLote(
  prototipo: PocaoPrototype,
  novoLote: string,
  ingrediente: string,
  quantidade: number,
): PocaoPrototype {
  const variante = prototipo.clone(novoLote);
  variante.ajustarQuantidade(ingrediente, quantidade);
  return variante;
}
