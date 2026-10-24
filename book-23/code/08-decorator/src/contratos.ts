export interface ResultadoAtaque {
  readonly potencia: number;
  readonly efeitos: readonly string[];
}

// Component: o núcleo e cada camada oferecem a mesma operação.
export interface Ataque {
  executar(): ResultadoAtaque;
}
