import type { Memoria } from "./diario.js";

export function validarLimite(limite: number): void {
  if (!Number.isSafeInteger(limite) || limite <= 0) throw new Error("Limite deve ser inteiro positivo seguro.");
}
export function rotuloValido(rotulo: string): string {
  if (!rotulo.trim()) throw new Error("Rótulo obrigatório.");
  return rotulo.trim();
}
export function validarIndice(indice: number, tamanho: number): void {
  if (!Number.isInteger(indice) || indice < 0 || indice >= tamanho) throw new Error("Índice de memória inválido.");
}

export class GuardiaoDasMemorias {
  readonly #limite: number;
  readonly #historico: { token: Memoria; rotulo: string }[] = [];
  constructor(limite: number = 10) { validarLimite(limite); this.#limite = limite; }

  adicionar(token: Memoria, rotulo: string): void {
    const titulo = rotuloValido(rotulo);
    this.#historico.push({ token, rotulo: titulo });
    if (this.#historico.length > this.#limite) this.#historico.shift();
  }
  obter(indice: number): Memoria {
    validarIndice(indice, this.#historico.length);
    return this.#historico[indice]!.token;
  }
  listar(): readonly Readonly<{ indice: number; rotulo: string }>[] {
    return this.#historico.map(({ rotulo }, indice) => Object.freeze({ indice, rotulo }));
  }
}
