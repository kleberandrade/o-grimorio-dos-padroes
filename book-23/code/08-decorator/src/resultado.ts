import type { ResultadoAtaque } from "./contratos.js";

export function validarInteiroSeguro(valor: number, campo: string, minimo = 0): void {
  if (!Number.isSafeInteger(valor) || valor < minimo) {
    throw new Error(`${campo} deve ser inteiro seguro maior ou igual a ${minimo}.`);
  }
}

export function criarResultado(potencia: number, efeitos: readonly string[]): ResultadoAtaque {
  validarInteiroSeguro(potencia, "Potência");
  return Object.freeze({ potencia, efeitos: Object.freeze([...efeitos]) });
}
