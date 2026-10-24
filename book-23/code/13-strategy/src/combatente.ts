import type { Alvo, EstrategiaDeAtaque, ResultadoAtaque } from "./contratos.js";
import { normalizarAlvo, normalizarNome } from "./resultado.js";

export class Combatente {
  readonly #nome: string;
  #estrategia: EstrategiaDeAtaque;

  constructor(nome: string, estrategia: EstrategiaDeAtaque) {
    this.#nome = normalizarNome(nome);
    this.#estrategia = estrategia;
  }

  get nome(): string { return this.#nome; }
  estrategiaAtual(): EstrategiaDeAtaque { return this.#estrategia; }
  trocarEstrategia(estrategia: EstrategiaDeAtaque): void { this.#estrategia = estrategia; }

  atacar(alvo: Alvo): ResultadoAtaque {
    return this.#estrategia.atacar(normalizarAlvo(alvo));
  }
}
