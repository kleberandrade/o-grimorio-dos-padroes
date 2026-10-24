import type { Turno } from "./contratos.js";

// Contraprova local: duas equipes recebem o MESMO objeto de preferências.
// A função cria um cenário novo a cada chamada; não altera o registro compartilhado.
export function criarExemploDePreferenciaGlobal() {
  const preferencias: { turno: Turno } = { turno: "dia" };
  return { sul: preferencias, norte: preferencias };
}
