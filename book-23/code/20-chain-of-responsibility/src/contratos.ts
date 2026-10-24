type BasePedido = { readonly solicitante: string; readonly prioridade: "normal" | "urgente" };
export type Pedido = BasePedido & (
  { readonly tipo: "passagem"; readonly rota: "galeria-interna" | "porta-dos-carros" }
  | { readonly tipo: "provisoes"; readonly quantidade: number }
  | { readonly tipo: "audiencia"; readonly assunto: string }
);
export type Status = "tratado" | "negado" | "naoTratado";
export interface Decisao { readonly status: Status; readonly motivo: string; }
export interface Handler { readonly nome: string; decidir(pedido: Pedido): Decisao; }
export interface Passo { readonly handler: string; readonly decisao: Status; }
export interface Resultado extends Decisao {
  readonly responsavel: string | null;
  readonly percurso: readonly Passo[];
}

export function texto(valor: unknown): string {
  if (typeof valor !== "string" || !valor.trim()) throw new Error("Texto não vazio obrigatório.");
  return valor.trim();
}

export function normalizarPedido(pedido: Pedido): Pedido {
  const solicitante = texto(pedido.solicitante);
  const prioridade = pedido.prioridade;
  if (prioridade !== "normal" && prioridade !== "urgente") throw new Error("Prioridade inválida.");
  switch (pedido.tipo) {
    case "passagem":
      if (pedido.rota !== "galeria-interna" && pedido.rota !== "porta-dos-carros") throw new Error("Rota inválida.");
      return Object.freeze({ tipo: "passagem", solicitante, prioridade, rota: pedido.rota });
    case "provisoes":
      if (!Number.isSafeInteger(pedido.quantidade) || pedido.quantidade <= 0) throw new Error("Quantidade deve ser inteira positiva segura.");
      return Object.freeze({ tipo: "provisoes", solicitante, prioridade, quantidade: pedido.quantidade });
    case "audiencia":
      return Object.freeze({ tipo: "audiencia", solicitante, prioridade, assunto: texto(pedido.assunto) });
    default: throw new Error("Tipo de pedido inválido.");
  }
}

export function decisao(status: Status, motivo: string): Decisao {
  return Object.freeze({ status, motivo });
}
