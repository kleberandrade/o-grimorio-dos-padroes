import type { Expressao, Contexto } from "../src/expressoes.js";

export class Repeticao implements Expressao {
  readonly #filha: Expressao;
  readonly #vezes: number;
  readonly #custo: number;
  constructor(filha: Expressao, vezes: number) {
    if (!Number.isInteger(vezes) || vezes < 1 || vezes > 9) throw new Error("Repetição deve ser de 1 a 9.");
    const custoFilha = filha.operacoes();
    if (!Number.isSafeInteger(custoFilha) || custoFilha < 1 || !Number.isSafeInteger(custoFilha * vezes)) throw new Error("Custo de repetição inválido.");
    this.#filha = filha; this.#vezes = vezes; this.#custo = custoFilha * vezes;
    Object.freeze(this);
  }
  operacoes(): number { return this.#custo; }
  interpretar(contexto: Contexto): void { for (let indice = 0; indice < this.#vezes; indice += 1) this.#filha.interpretar(contexto); }
}
