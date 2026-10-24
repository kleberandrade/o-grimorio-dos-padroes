import type { Ingrediente } from "./contratos.js";

export function textoObrigatorio(texto: string, campo: string): string {
  const valor = texto.trim();
  if (!valor) throw new Error(`Campo obrigatório: ${campo}.`);
  return valor;
}

export function validarQuantidade(quantidade: number): void {
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw new Error("Quantidade deve ser positiva e finita.");
  }
}

export function validarNovoLote(atual: string, proximo: string): string {
  const lote = textoObrigatorio(proximo, "Lote");
  if (lote === atual) throw new Error("Clone exige lote diferente do original.");
  return lote;
}

// Cópia profunda do modelo conhecido, não de um grafo arbitrário de objetos.
export function copiarIngrediente(item: Ingrediente): Ingrediente {
  validarQuantidade(item.dose.quantidade);
  return {
    nome: textoObrigatorio(item.nome, "Nome do ingrediente"),
    dose: { quantidade: item.dose.quantidade, unidade: item.dose.unidade },
    observacoes: item.observacoes.map((nota) => textoObrigatorio(nota, "Observação")),
  };
}
