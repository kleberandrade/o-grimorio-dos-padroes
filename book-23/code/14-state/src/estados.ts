import type { CondicaoDescanso, Estado, Transicao } from "./contratos.js";
import { transicao } from "./contratos.js";

export class EstadoNormal implements Estado {
  readonly nome = "normal";
  readonly intervalosFuria = 0;
  constructor() { Object.freeze(this); }

  atacar(): Transicao {
    return transicao(new EstadoFurioso(2), true, "Golpe normal; fúria iniciada com dois intervalos.");
  }

  descansar(condicao: CondicaoDescanso): Transicao {
    return condicao.protegido
      ? transicao(this, true, "Descanso protegido concluído; permanece normal.")
      : transicao(this, false, "Descanso recusado sem proteção informada.");
  }
}

export class EstadoFurioso implements Estado {
  readonly nome = "furioso";
  readonly intervalosFuria: 1 | 2;

  constructor(intervalos: 1 | 2 = 2) {
    if (intervalos !== 1 && intervalos !== 2) throw new Error("Fúria requer um ou dois intervalos.");
    this.intervalosFuria = intervalos;
    Object.freeze(this);
  }

  atacar(): Transicao {
    const proximo = this.intervalosFuria === 2 ? new EstadoFurioso(1) : new EstadoExausto();
    return transicao(proximo, true, "Golpe furioso; um intervalo consumido.");
  }

  descansar(_condicao: CondicaoDescanso): Transicao {
    return transicao(this, false, "Fúria impede descanso; intervalos preservados.");
  }
}

export class EstadoExausto implements Estado {
  readonly nome = "exausto";
  readonly intervalosFuria = 0;
  constructor() { Object.freeze(this); }

  atacar(): Transicao {
    return transicao(this, false, "Ataque recusado por exaustão; nenhum golpe executado.");
  }

  descansar(condicao: CondicaoDescanso): Transicao {
    return condicao.protegido
      ? transicao(new EstadoNormal(), true, "Descanso protegido completo; retorno ao normal.")
      : transicao(this, false, "Descanso recusado sem proteção informada.");
  }
}
