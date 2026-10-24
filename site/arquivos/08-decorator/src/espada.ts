import type { Ataque, ResultadoAtaque } from "./contratos.js";
import { criarResultado, validarInteiroSeguro } from "./resultado.js";

export class Espada implements Ataque {
  readonly #potencia: number;

  constructor(potencia = 10) {
    validarInteiroSeguro(potencia, "Potência");
    this.#potencia = potencia;
  }

  executar(): ResultadoAtaque {
    return criarResultado(this.#potencia, ["espada"]);
  }
}
