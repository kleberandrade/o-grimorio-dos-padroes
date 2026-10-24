export interface PedidoCota { readonly grupo: string; readonly quantidade: number; }
export interface Cota { readonly grupo: string; readonly solicitado: number; readonly concedido: number; }

// Política local explícita: prioridade pela ordem recebida, sem alegação de justiça universal.
export function planejarCotas(disponivel: number, pedidos: readonly PedidoCota[]) {
  if (!Number.isSafeInteger(disponivel) || disponivel < 0) throw new Error("Disponível deve ser inteiro não negativo seguro.");
  const nomes = new Set<string>();
  const copia = pedidos.map((pedido) => {
    const grupo = pedido.grupo.trim();
    if (!grupo || nomes.has(grupo)) throw new Error("Grupos devem ser não vazios e distintos.");
    if (!Number.isSafeInteger(pedido.quantidade) || pedido.quantidade <= 0) throw new Error("Cota solicitada deve ser inteira positiva segura.");
    nomes.add(grupo);
    return { grupo, quantidade: pedido.quantidade };
  });
  let restante = disponivel;
  const cotas: Cota[] = copia.map(({ grupo, quantidade }) => {
    const concedido = Math.min(quantidade, restante);
    restante -= concedido;
    return Object.freeze({ grupo, solicitado: quantidade, concedido });
  });
  return Object.freeze({ cotas: Object.freeze(cotas), restante });
}
