import type { Ativacao, ContextoUso, Essencia } from "./contratos.js";

export class EssenciaFogo implements Essencia {
  readonly nome = "fogo";

  ativar(contexto: ContextoUso): Ativacao {
    if (contexto.nucleoMolhado) {
      return Object.freeze({ estado: "bloqueada", motivo: "Fogo não ativa com núcleo molhado." });
    }
    return Object.freeze({ estado: "ativa", custo: 3, efeito: "calor" });
  }
}

export class EssenciaGelo implements Essencia {
  readonly nome = "gelo";

  ativar(_contexto: ContextoUso): Ativacao {
    return Object.freeze({ estado: "ativa", custo: 4, efeito: "frio" });
  }
}
