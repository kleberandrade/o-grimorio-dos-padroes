import type { FabricaElemental, ResultadoDeEnsaio } from "./contratos.js";

export function ensaiarKit(
  fabrica: FabricaElemental,
  intensidade: number,
): ResultadoDeEnsaio {
  const arma = fabrica.criarArma();
  const protecao = fabrica.criarProtecao();
  const pulso = arma.emitirPulso(intensidade);
  return protecao.ensaiar(pulso);
}
