import type { Memoria, PortaMemorias } from "../src/diario.js";
import { rotuloValido, validarLimite } from "../src/guardiao.js";

export class LinhaDoTempo {
  readonly #porta: PortaMemorias;
  readonly #limite: number;
  readonly #pontos: { token: Memoria; rotulo: string }[];
  #cursor = 0;

  constructor(porta: PortaMemorias, limite: number = 10) {
    validarLimite(limite);
    this.#porta = porta;
    this.#limite = limite;
    this.#pontos = [{ token: porta.salvar(), rotulo: "Inicial" }];
  }

  confirmar(rotulo: string): boolean {
    const titulo = rotuloValido(rotulo);
    if (this.#porta.correspondeCheckpoint(this.#pontos[this.#cursor]!.token)) return false;
    const token = this.#porta.salvar();
    this.#pontos.splice(this.#cursor + 1);
    this.#pontos.push({ token, rotulo: titulo });
    if (this.#pontos.length > this.#limite) this.#pontos.shift();
    this.#cursor = this.#pontos.length - 1;
    return true;
  }

  undo(): boolean {
    this.#exigirConfirmado();
    if (this.#cursor === 0) return false;
    this.#porta.restaurar(this.#pontos[this.#cursor - 1]!.token);
    this.#cursor -= 1;
    return true;
  }

  redo(): boolean {
    this.#exigirConfirmado();
    if (this.#cursor === this.#pontos.length - 1) return false;
    this.#porta.restaurar(this.#pontos[this.#cursor + 1]!.token);
    this.#cursor += 1;
    return true;
  }

  listar(): readonly Readonly<{ indice: number; rotulo: string; atual: boolean }>[] {
    return this.#pontos.map(({ rotulo }, indice) => Object.freeze({ indice, rotulo, atual: indice === this.#cursor }));
  }

  #exigirConfirmado(): void {
    if (!this.#porta.correspondeCheckpoint(this.#pontos[this.#cursor]!.token)) {
      throw new Error("Edição pendente: confirme um checkpoint antes de navegar.");
    }
  }
}
