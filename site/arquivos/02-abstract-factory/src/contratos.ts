export interface Pulso {
  readonly afinidade: string;
  readonly origem: string;
  readonly intensidade: number;
}

// Resultado do simulador de afinidades, não certificado de resistência física.
export interface ResultadoDeEnsaio {
  readonly afinidade: string;
  readonly arma: string;
  readonly protecao: string;
  readonly intensidade: number;
}

export interface Arma {
  readonly nome: string;
  readonly afinidade: string;
  emitirPulso(intensidade: number): Pulso;
}

export interface Protecao {
  readonly nome: string;
  readonly afinidade: string;
  ensaiar(pulso: Pulso): ResultadoDeEnsaio;
}

// Abstract Factory: cada operação cria uma categoria de produto da família.
export interface FabricaElemental {
  criarArma(): Arma;
  criarProtecao(): Protecao;
}
