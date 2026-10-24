import type { DragaoNovo, PedidoDeAtaque, ResultadoDeAtaque } from "./contratos.js";
import { RecursoSemEquivalente } from "./contratos.js";
import { normalizarAlvo, validarVelocidade } from "./validacao.js";

export class DragaoNativo implements DragaoNovo {
  constructor(private readonly metrosPorSegundo = 10) {
    validarVelocidade(metrosPorSegundo);
  }

  velocidadeMps(): number {
    return this.metrosPorSegundo;
  }

  atacar(pedido: PedidoDeAtaque): ResultadoDeAtaque {
    if (pedido.efeito !== "fogo") throw new RecursoSemEquivalente(pedido.efeito);
    return Object.freeze({ alvo: normalizarAlvo(pedido.alvo), efeito: "fogo", rochaLiberada: true });
  }
}
