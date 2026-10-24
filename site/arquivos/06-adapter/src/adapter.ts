import type { DragaoNovo, PedidoDeAtaque, ResultadoDeAtaque } from "./contratos.js";
import { RecursoSemEquivalente } from "./contratos.js";
import type { DragaoAntigo } from "./legado/dragao-antigo.js";
import { normalizarAlvo, validarVelocidade } from "./validacao.js";

export class DragaoAdapter implements DragaoNovo {
  constructor(private readonly antigo: DragaoAntigo) {}

  velocidadeMps(): number {
    const kmh = this.antigo.voarVelocidade();
    validarVelocidade(kmh);
    return kmh / 3.6;
  }

  atacar(pedido: PedidoDeAtaque): ResultadoDeAtaque {
    if (pedido.efeito !== "fogo") throw new RecursoSemEquivalente(pedido.efeito);
    const alvo = normalizarAlvo(pedido.alvo);
    const resposta = this.antigo.soltarFogo(alvo);
    return Object.freeze({ alvo: resposta.rocha, efeito: "fogo", rochaLiberada: resposta.desobstruida });
  }
}
