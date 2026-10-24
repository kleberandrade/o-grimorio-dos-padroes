export interface PedidoDeAtaque {
  readonly alvo: string;
  readonly efeito: "fogo" | "gelo";
}

export interface ResultadoDeAtaque {
  readonly alvo: string;
  readonly efeito: "fogo" | "gelo";
  readonly rochaLiberada: boolean;
}

export interface DragaoNovo {
  velocidadeMps(): number;
  // Pode lançar RecursoSemEquivalente se o efeito não for oferecido pelo pacto.
  atacar(pedido: PedidoDeAtaque): ResultadoDeAtaque;
}

export class RecursoSemEquivalente extends Error {
  constructor(efeito: string) {
    super(`Pacto não oferece equivalente para ${efeito}.`);
    this.name = "RecursoSemEquivalente";
  }
}
