import type { AcaoDeComporta, OrdemDeComporta, Registro, Turno } from "./contratos.js";

export class EquipeDeComportas {
  readonly #registro: Registro;
  readonly #equipe: string;
  #turno: Turno;

  constructor(registro: Registro, equipe: string, turno: Turno) {
    const nome = equipe.trim();
    if (!nome) throw new Error("Nome da equipe obrigatório.");
    this.#registro = registro;
    this.#equipe = nome;
    this.#turno = turno;
  }

  definirTurno(turno: Turno): void {
    this.#turno = turno;
  }

  emitirOrdem(comporta: string, acao: AcaoDeComporta): OrdemDeComporta {
    const destino = comporta.trim();
    if (!destino) throw new Error("Comporta obrigatória.");
    const ordem = Object.freeze({ equipe: this.#equipe, comporta: destino, acao, turno: this.#turno });
    this.#registro.registrar(ordem);
    return ordem;
  }
}
