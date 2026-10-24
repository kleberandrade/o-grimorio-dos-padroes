import type { OrdemDeComporta, Registro } from "./contratos.js";

export class RegistroEmMemoria implements Registro {
  #ordens: OrdemDeComporta[] = [];

  registrar(ordem: OrdemDeComporta): void {
    const equipe = ordem.equipe.trim();
    const comporta = ordem.comporta.trim();
    if (!equipe || !comporta) throw new Error("Equipe e comporta são obrigatórias.");
    this.#ordens.push(Object.freeze({ equipe, comporta, acao: ordem.acao, turno: ordem.turno }));
  }

  listarOrdens(): readonly OrdemDeComporta[] {
    return [...this.#ordens];
  }
}
