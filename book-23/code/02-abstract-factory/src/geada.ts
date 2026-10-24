import type { Arma, FabricaElemental, Protecao, Pulso, ResultadoDeEnsaio } from "./contratos.js";
import { criarPulso, ensaiarPulso } from "./ensaio.js";

export class ArmaDeGeada implements Arma {
  readonly nome = "Lâmina de geada";
  readonly afinidade = "geada";

  emitirPulso(intensidade: number): Pulso {
    return criarPulso(this.afinidade, this.nome, intensidade);
  }
}

export class ProtecaoDeGeada implements Protecao {
  readonly nome = "Escudo de geada";
  readonly afinidade = "geada";

  ensaiar(pulso: Pulso): ResultadoDeEnsaio {
    return ensaiarPulso(this.afinidade, this.nome, pulso);
  }
}

export class FabricaDeGeada implements FabricaElemental {
  criarArma(): Arma {
    return new ArmaDeGeada();
  }

  criarProtecao(): Protecao {
    return new ProtecaoDeGeada();
  }
}
