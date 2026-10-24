import type { Alvo, ResultadoAtaque } from "./contratos.js";

export function normalizarNome(nome: string): string {
  const valor = nome.trim();
  if (!valor) throw new Error("Nome obrigatório.");
  return valor;
}

export function normalizarAlvo(alvo: Alvo): Alvo {
  const nome = normalizarNome(alvo.nome);
  if (!Number.isFinite(alvo.distanciaMetros) || alvo.distanciaMetros < 0) {
    throw new Error("Distância deve ser não negativa e finita.");
  }
  if (alvo.resistencia !== "comum" && alvo.resistencia !== "reforcada") throw new Error("Resistência não suportada.");
  return Object.freeze({ nome, distanciaMetros: alvo.distanciaMetros, resistencia: alvo.resistencia });
}

export function inadequado(tecnica: string, alvo: Alvo, motivo: string): ResultadoAtaque {
  return Object.freeze({ estado: "inadequado", tecnica, alvo: alvo.nome, custo: 0, motivo });
}

export function executado(tecnica: string, alvo: Alvo, custo: number, efeito: string): ResultadoAtaque {
  if (!Number.isSafeInteger(custo) || custo < 0) throw new Error("Custo deve ser inteiro seguro não negativo.");
  return Object.freeze({ estado: "executado", tecnica, alvo: alvo.nome, custo, efeito });
}
