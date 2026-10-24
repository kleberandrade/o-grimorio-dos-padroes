import { EstoqueMinerio, quantidadePositiva } from "./estoque.js";
import type { Reserva, SnapshotEstoque } from "./estoque.js";

export interface Comando {
  readonly descricao: string;
  executar(): void;
  desfazer(): void;
}

export class ComandoReservar implements Comando {
  readonly #estoque: EstoqueMinerio;
  readonly #quantidade: number;
  #estado: "novo" | "executado" | "desfeito" = "novo";
  #reserva: Reserva | null = null;
  #antes: SnapshotEstoque | null = null;

  constructor(estoque: EstoqueMinerio, quantidade: number) {
    quantidadePositiva(quantidade);
    this.#estoque = estoque;
    this.#quantidade = quantidade;
  }
  get descricao(): string { return `reservar ${this.#quantidade}`; }
  get reserva(): Reserva | null { return this.#reserva; }
  situacao() { return Object.freeze({ estado: this.#estado, quantidade: this.#quantidade, antes: this.#antes }); }

  executar(): void {
    if (this.#estado !== "novo") throw new Error("Comando já executado; crie outra ordem.");
    const antes = this.#estoque.snapshot();
    const reserva = this.#estoque.reservar(this.#quantidade);
    this.#antes = antes;
    this.#reserva = reserva;
    this.#estado = "executado";
  }

  desfazer(): void {
    if (this.#estado !== "executado" || this.#reserva === null) throw new Error("Comando não possui execução ativa para desfazer.");
    this.#estoque.cancelar(this.#reserva);
    this.#estado = "desfeito";
  }
}
