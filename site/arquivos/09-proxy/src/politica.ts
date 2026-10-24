import type { EntradaNegada, PoliticaAcesso, Visitante } from "./contratos.js";

export function normalizarVisitante(visitante: Visitante): Visitante {
  const nome = visitante.nome.trim();
  if (!nome) throw new Error("Nome do visitante obrigatório.");
  return Object.freeze({ nome, mandatoValido: visitante.mandatoValido });
}

// Convenção didática: este booleano fornecido não autentica uma pessoa.
export const politicaPorMandato: PoliticaAcesso = (visitante) => ({
  permitida: visitante.mandatoValido,
  motivo: visitante.mandatoValido ? "Mandato informado como válido." : "Mandato não informado como válido.",
});

export function negarEntrada(visitante: Visitante, motivo: string): EntradaNegada {
  return Object.freeze({ estado: "negada", visitante: visitante.nome, motivo });
}
