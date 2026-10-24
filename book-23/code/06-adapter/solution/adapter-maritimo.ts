import type { DragaoNovo, PedidoDeAtaque, ResultadoDeAtaque } from "../src/contratos.js";
import { RecursoSemEquivalente } from "../src/contratos.js";
import { normalizarAlvo, validarVelocidade } from "../src/validacao.js";
import type { DragaoMaritimo } from "./fornecedor-maritimo.js";

export class DragaoMaritimoAdapter implements DragaoNovo {
  constructor(private readonly fornecedor: DragaoMaritimo) {}

  velocidadeMps(): number {
    const nos = this.fornecedor.velocidadeEmNos();
    validarVelocidade(nos);
    return nos * (1852 / 3600);
  }

  atacar(pedido: PedidoDeAtaque): ResultadoDeAtaque {
    if (pedido.efeito !== "fogo") throw new RecursoSemEquivalente(pedido.efeito);
    const resposta = this.fornecedor.aquecerRocha(normalizarAlvo(pedido.alvo));
    return Object.freeze({ alvo: resposta.identificador, efeito: "fogo", rochaLiberada: resposta.liberada });
  }
}
