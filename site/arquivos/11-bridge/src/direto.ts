import type { ContextoUso, Essencia, ResultadoUso } from "./contratos.js";
import { resolverUso } from "./resultado.js";

// Uma forma fixa: basta uma função composta com a essência, sem o eixo de classes Arma.
export function empunharEspadaDireta(essencia: Essencia, contexto: ContextoUso): ResultadoUso {
  return resolverUso("espada", "corte", 1, essencia, contexto);
}
