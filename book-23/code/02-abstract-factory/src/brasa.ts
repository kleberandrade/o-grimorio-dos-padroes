import type { Arma, FabricaElemental, Protecao, Pulso, ResultadoDeEnsaio } from "./contratos.js";
import { criarPulso, ensaiarPulso } from "./ensaio.js";

export class ArmaDeBrasa implements Arma {
  readonly nome = "Lâmina de brasa";
  readonly afinidade = "brasa";

  emitirPulso(intensidade: number): Pulso {
    return criarPulso(this.afinidade, this.nome, intensidade);
  }
}

export class ProtecaoDeBrasa implements Protecao {
  readonly nome = "Escudo de brasa";
  readonly afinidade = "brasa";

  ensaiar(pulso: Pulso): ResultadoDeEnsaio {
    return ensaiarPulso(this.afinidade, this.nome, pulso);
  }
}

export class FabricaDeBrasa implements FabricaElemental {
  criarArma(): Arma {
    return new ArmaDeBrasa();
  }

  criarProtecao(): Protecao {
    return new ProtecaoDeBrasa();
  }
}
