export type Missao = "torre" | "galeria";

export interface Equipamento {
  readonly nome: string;
  readonly protecoes: readonly string[];
}

// Produto de configuração: esta ficha descreve alguém, não cria uma pessoa.
export interface FichaDePersonagem {
  readonly nome: string;
  readonly classe: string;
  readonly vida: number;
  readonly missao: Missao;
  readonly equipamentos: readonly Equipamento[];
}

// Builder: o Director conhece as etapas, não a representação do resultado.
export interface EtapasDeExpedicao {
  reiniciar(): void;
  definirIdentidade(nome: string, classe: string): void;
  definirVida(vida: number): void;
  definirMissao(missao: Missao): void;
  adicionarEquipamento(equipamento: Equipamento): void;
}

export interface DadosEmConstrucao {
  nome?: string;
  classe?: string;
  vida?: number;
  missao?: Missao;
  equipamentos: Equipamento[];
}
