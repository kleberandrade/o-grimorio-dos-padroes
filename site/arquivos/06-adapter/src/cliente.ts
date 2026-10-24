import type { DragaoNovo, ResultadoDeAtaque } from "./contratos.js";

export function liberarRochaDoFarol(
  dragao: DragaoNovo,
  alvo: string,
): { velocidadeMps: number; resultado: ResultadoDeAtaque } {
  const velocidadeMps = dragao.velocidadeMps();
  const resultado = dragao.atacar({ alvo, efeito: "fogo" });
  return { velocidadeMps, resultado };
}
