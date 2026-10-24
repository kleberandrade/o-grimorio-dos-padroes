import type { Ataque, ResultadoAtaque } from "./contratos.js";
import { criarResultado, validarInteiroSeguro } from "./resultado.js";

export class MantoDeCalor implements Ataque {
  readonly #interno: Ataque;
  readonly #bonus: number;

  constructor(interno: Ataque, bonus = 3) {
    validarInteiroSeguro(bonus, "Bônus");
    this.#interno = interno;
    this.#bonus = bonus;
  }

  executar(): ResultadoAtaque {
    const resultado = this.#interno.executar();
    validarInteiroSeguro(resultado.potencia, "Potência");
    return criarResultado(resultado.potencia + this.#bonus, [...resultado.efeitos, `calor +${this.#bonus}`]);
  }
}

export class MantoAmplificador implements Ataque {
  readonly #interno: Ataque;
  readonly #fator: number;

  constructor(interno: Ataque, fator = 2) {
    validarInteiroSeguro(fator, "Fator", 1);
    this.#interno = interno;
    this.#fator = fator;
  }

  executar(): ResultadoAtaque {
    const resultado = this.#interno.executar();
    validarInteiroSeguro(resultado.potencia, "Potência");
    return criarResultado(resultado.potencia * this.#fator, [...resultado.efeitos, `amplificação x${this.#fator}`]);
  }
}
