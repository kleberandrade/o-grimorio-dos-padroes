import type { Pulso, ResultadoDeEnsaio } from "./contratos.js";

export function validarIntensidade(intensidade: number): void {
  if (!Number.isFinite(intensidade) || intensidade <= 0) {
    throw new Error("Intensidade deve ser positiva e finita.");
  }
}

export function criarPulso(
  afinidade: string,
  origem: string,
  intensidade: number,
): Pulso {
  validarIntensidade(intensidade);
  return Object.freeze({ afinidade, origem, intensidade });
}

export function ensaiarPulso(
  afinidade: string,
  protecao: string,
  pulso: Pulso,
): ResultadoDeEnsaio {
  validarIntensidade(pulso.intensidade);
  if (pulso.afinidade !== afinidade) {
    throw new Error(`Afinidades incompatíveis: ${pulso.afinidade} / ${afinidade}.`);
  }
  return Object.freeze({
    afinidade,
    arma: pulso.origem,
    protecao,
    intensidade: pulso.intensidade,
  });
}
