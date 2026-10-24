export type Simbolo = "F" | "I" | "L";
export interface Contexto { registrar(simbolo: Simbolo): void; }
export interface Expressao {
  operacoes(): number;
  interpretar(contexto: Contexto): void;
}

export class ContextoArcano implements Contexto {
  #calor = 0;
  #frio = 0;
  #luz = 0;
  readonly #sequencia: Simbolo[] = [];
  registrar(simbolo: Simbolo): void {
    if (simbolo !== "F" && simbolo !== "I" && simbolo !== "L") throw new Error("Símbolo de contexto inválido.");
    this.#sequencia.push(simbolo);
    if (simbolo === "F") this.#calor += 1;
    if (simbolo === "I") this.#frio += 1;
    if (simbolo === "L") this.#luz += 1;
  }
  snapshot() { return Object.freeze({ calor: this.#calor, frio: this.#frio, luz: this.#luz,
    sequencia: Object.freeze([...this.#sequencia]) }); }
}
export class RunaFogo implements Expressao {
  constructor() { Object.freeze(this); }
  operacoes(): number { return 1; }
  interpretar(contexto: Contexto): void { contexto.registrar("F"); }
}
export class RunaGelo implements Expressao {
  constructor() { Object.freeze(this); }
  operacoes(): number { return 1; }
  interpretar(contexto: Contexto): void { contexto.registrar("I"); }
}
export class RunaLuz implements Expressao {
  constructor() { Object.freeze(this); }
  operacoes(): number { return 1; }
  interpretar(contexto: Contexto): void { contexto.registrar("L"); }
}
export class Sequencia implements Expressao {
  readonly #filhas: readonly Expressao[];
  readonly #operacoes: number;
  constructor(filhas: readonly Expressao[]) {
    if (filhas.length === 0) throw new Error("Sequência AST não pode ser vazia.");
    this.#filhas = Object.freeze([...filhas]);
    this.#operacoes = this.#filhas.reduce((total, filha) => {
      const valor = filha.operacoes();
      if (!Number.isSafeInteger(valor) || valor <= 0 || !Number.isSafeInteger(total + valor)) throw new Error("Custo de expressão inválido.");
      return total + valor;
    }, 0);
    Object.freeze(this);
  }
  operacoes(): number { return this.#operacoes; }
  interpretar(contexto: Contexto): void { for (const filha of this.#filhas) filha.interpretar(contexto); }
}
