import type { ContextoUso, Essencia, ResultadoUso } from "./contratos.js";
import { resolverUso } from "./resultado.js";

// Abstraction: conserva o vínculo por composição com Implementor.
export abstract class Arma {
  #essencia: Essencia;

  constructor(essencia: Essencia) { this.#essencia = essencia; }

  trocarEssencia(essencia: Essencia): void { this.#essencia = essencia; }
  essenciaAtual(): Essencia { return this.#essencia; }

  protected usar(forma: string, gesto: string, custoBase: number, contexto: ContextoUso): ResultadoUso {
    return resolverUso(forma, gesto, custoBase, this.#essencia, contexto);
  }

  abstract empunhar(contexto: ContextoUso): ResultadoUso;
}

export class Espada extends Arma {
  override empunhar(contexto: ContextoUso): ResultadoUso {
    return this.usar("espada", "corte", 1, contexto);
  }
}

export class Arco extends Arma {
  override empunhar(contexto: ContextoUso): ResultadoUso {
    return this.usar("arco", "disparo", 2, contexto);
  }
}
