import type { Comando } from "./comando.js";

export class Invocador {
  readonly #limite: number;
  readonly #historico: { comando: Comando; descricao: string }[] = [];

  constructor(limite: number = 10) {
    if (!Number.isSafeInteger(limite) || limite <= 0) throw new Error("Limite de histórico deve ser inteiro positivo seguro.");
    this.#limite = limite;
  }

  executar(comando: Comando): void {
    const descricao = comando.descricao;
    comando.executar();
    this.#historico.push({ comando, descricao });
    if (this.#historico.length > this.#limite) this.#historico.shift();
  }

  desfazerUltimo(): boolean {
    const entrada = this.#historico.at(-1);
    if (!entrada) return false;
    entrada.comando.desfazer();
    this.#historico.pop();
    return true;
  }

  listarHistorico(): readonly Readonly<{ descricao: string }>[] {
    return this.#historico.map(({ descricao }) => Object.freeze({ descricao }));
  }
}
