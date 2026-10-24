import type { Comprovante, PedidoDeEnvio } from "./contratos.js";
import type { CriadorDeNotificacoes } from "./criadores.js";

// O cliente ignora os produtos concretos e não recebe um discriminador de canal.
export function avisarGuilda(
  criador: CriadorDeNotificacoes,
  pedido: PedidoDeEnvio,
): Comprovante {
  return criador.enviar(pedido);
}
