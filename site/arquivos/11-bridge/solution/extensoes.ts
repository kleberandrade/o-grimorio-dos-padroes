import { Arma } from "../src/armas.js";
import type { Ativacao, ContextoUso, Essencia, ResultadoUso } from "../src/contratos.js";

export class Escudo extends Arma {
  override empunhar(contexto: ContextoUso): ResultadoUso {
    return this.usar("escudo", "aparar", 2, contexto);
  }
}

export class EssenciaVento implements Essencia {
  readonly nome = "vento";

  ativar(_contexto: ContextoUso): Ativacao {
    return Object.freeze({ estado: "ativa", custo: 2, efeito: "impulso" });
  }
}
