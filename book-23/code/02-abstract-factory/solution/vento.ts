import type { Arma, FabricaElemental, Protecao, Pulso, ResultadoDeEnsaio } from "../src/contratos.js";
import { criarPulso, ensaiarPulso } from "../src/ensaio.js";

export class ArmaDeVento implements Arma {
  readonly nome = "Lâmina de vento";
  readonly afinidade = "vento";

  emitirPulso(intensidade: number): Pulso {
    return criarPulso(this.afinidade, this.nome, intensidade);
  }
}

export class ProtecaoDeVento implements Protecao {
  readonly nome = "Escudo de vento";
  readonly afinidade = "vento";

  ensaiar(pulso: Pulso): ResultadoDeEnsaio {
    return ensaiarPulso(this.afinidade, this.nome, pulso);
  }
}

export class FabricaDeVento implements FabricaElemental {
  criarArma(): Arma {
    return new ArmaDeVento();
  }

  criarProtecao(): Protecao {
    return new ProtecaoDeVento();
  }
}
