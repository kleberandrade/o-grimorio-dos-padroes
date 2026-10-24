import { validarInteiroSeguro } from "./resultado.js";

// Alternativa sem wrappers para uma fórmula fixa: soma, depois multiplica.
export function calcularPotenciaDireta(base: number, bonus: number, fator: number): number {
  validarInteiroSeguro(base, "Potência");
  validarInteiroSeguro(bonus, "Bônus");
  validarInteiroSeguro(fator, "Fator", 1);
  const soma = base + bonus;
  validarInteiroSeguro(soma, "Potência");
  const total = soma * fator;
  validarInteiroSeguro(total, "Potência");
  return total;
}
