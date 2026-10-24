import type { Ataque, ResultadoAtaque } from "../src/contratos.js";
import { criarResultado, validarInteiroSeguro } from "../src/resultado.js";

export class MantoLimitador implements Ataque {
  readonly #interno: Ataque;
  readonly #teto: number;

  constructor(interno: Ataque, teto: number) {
    validarInteiroSeguro(teto, "Teto");
    this.#interno = interno;
    this.#teto = teto;
  }

  executar(): ResultadoAtaque {
    const resultado = this.#interno.executar();
    validarInteiroSeguro(resultado.potencia, "Potência");
    return criarResultado(Math.min(resultado.potencia, this.#teto), [...resultado.efeitos, `limite ${this.#teto}`]);
  }
}
