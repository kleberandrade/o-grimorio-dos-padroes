export interface Reserva { readonly quantidade: number; }
export interface SnapshotEstoque {
  readonly disponivel: number;
  readonly reservado: number;
  readonly forjado: number;
  readonly reservasAtivas: readonly Readonly<{ quantidadeInicial: number; restante: number }>[];
}

export function quantidadePositiva(valor: number): void {
  if (!Number.isSafeInteger(valor) || valor <= 0) throw new Error("Quantidade deve ser inteira positiva segura.");
}

export class EstoqueMinerio {
  #disponivel: number;
  #forjado = 0;
  readonly #reservas = new Map<Reserva, number>();

  constructor(inicial: number) {
    if (!Number.isSafeInteger(inicial) || inicial < 0) throw new Error("Estoque inicial deve ser inteiro não negativo seguro.");
    this.#disponivel = inicial;
  }

  reservar(quantidade: number): Reserva {
    quantidadePositiva(quantidade);
    if (quantidade > this.#disponivel) throw new Error("Estoque insuficiente.");
    const reserva = Object.freeze({ quantidade });
    this.#disponivel -= quantidade;
    this.#reservas.set(reserva, quantidade);
    return reserva;
  }

  cancelar(reserva: Reserva): void {
    const restante = this.#reservas.get(reserva);
    if (restante === undefined) throw new Error("Reserva não está ativa neste estoque.");
    if (restante !== reserva.quantidade) throw new Error("Reserva consumida parcialmente; cancelamento integral recusado.");
    this.#reservas.delete(reserva);
    this.#disponivel += restante;
  }

  // Operação distinta e irreversível neste modelo; não existe desfazerForja.
  forjar(reserva: Reserva, quantidade: number): void {
    quantidadePositiva(quantidade);
    const restante = this.#reservas.get(reserva);
    if (restante === undefined) throw new Error("Reserva não está ativa neste estoque.");
    if (quantidade > restante) throw new Error("Quantidade maior que a reserva disponível.");
    if (quantidade === restante) this.#reservas.delete(reserva);
    else this.#reservas.set(reserva, restante - quantidade);
    this.#forjado += quantidade;
  }

  snapshot(): SnapshotEstoque {
    const reservas = [...this.#reservas].map(([reserva, restante]) =>
      Object.freeze({ quantidadeInicial: reserva.quantidade, restante }));
    return Object.freeze({ disponivel: this.#disponivel,
      reservado: reservas.reduce((total, item) => total + item.restante, 0),
      forjado: this.#forjado, reservasAtivas: Object.freeze(reservas) });
  }
}
