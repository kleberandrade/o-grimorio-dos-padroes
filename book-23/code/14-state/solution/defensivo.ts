import type { CondicaoDescanso, Estado, Transicao } from "../src/contratos.js";
import { transicao } from "../src/contratos.js";
import { EstadoNormal } from "../src/estados.js";

export class EstadoDefensivo implements Estado {
  readonly nome = "defensivo";
  readonly intervalosFuria = 0;
  constructor() { Object.freeze(this); }

  atacar(): Transicao {
    return transicao(new EstadoNormal(), true, "Contra-ataque controlado; retorno ao normal sem fúria.");
  }

  descansar(condicao: CondicaoDescanso): Transicao {
    return condicao.protegido
      ? transicao(new EstadoNormal(), true, "Guarda encerrada para descanso protegido completo.")
      : transicao(this, false, "Mantém guarda defensiva sem proteção para descansar.");
  }
}
