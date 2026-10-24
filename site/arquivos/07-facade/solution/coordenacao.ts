import type { PedidoPreparacao, ResultadoPreparacao } from "../src/contratos.js";
import type { FachadaPreparacao } from "../src/fachada.js";

export interface AutoridadeDiplomatica {
  consultarAutorizacao(missao: string): { permitida: boolean; motivo: string };
}

export type ResultadoVisita =
  | { estado: "nao-autorizada"; motivo: string }
  | { estado: "autorizada"; preparacao: ResultadoPreparacao };

// A autorização é uma responsabilidade externa, não um método da fachada.
export function coordenarVisita(
  fachada: FachadaPreparacao,
  autoridade: AutoridadeDiplomatica,
  pedido: PedidoPreparacao,
): ResultadoVisita {
  const autorizacao = autoridade.consultarAutorizacao(pedido.missao);
  if (!autorizacao.permitida) return { estado: "nao-autorizada", motivo: autorizacao.motivo };
  return { estado: "autorizada", preparacao: fachada.prepararMissao(pedido) };
}
