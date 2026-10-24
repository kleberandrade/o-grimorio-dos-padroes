export interface PedidoDeEnvio {
  readonly destino: string;
  readonly mensagem: string;
}

// Um registro de entrega local; não certifica recebimento por uma pessoa.
export interface Comprovante extends PedidoDeEnvio {
  readonly id: number;
  readonly canal: string;
}

export interface Correio {
  entregar(canal: string, pedido: PedidoDeEnvio): Comprovante;
}

// Product: todos os mensageiros atendem ao mesmo contrato.
export interface Mensageiro {
  entregar(pedido: PedidoDeEnvio): Comprovante;
}
