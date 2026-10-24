export interface PedidoPreparacao {
  readonly missao: string;
  readonly refeicoes: number;
  readonly peca: string;
  readonly rota: string;
}

export interface Mapa {
  readonly rota: string;
  readonly referencia: string;
}

export interface Cozinha { prepararRefeicoes(missao: string, quantidade: number): void; }
export interface Arsenal { reservarPeca(missao: string, peca: string): boolean; }
export interface Arquivo { buscarMapa(rota: string): Mapa; }
export interface Guarda { prepararPassagem(missao: string, rota: string, mapa: Mapa): void; }

export interface Subsistemas {
  readonly cozinha: Cozinha;
  readonly arsenal: Arsenal;
  readonly arquivo: Arquivo;
  readonly guarda: Guarda;
}

export interface EtapaPreparacao {
  readonly nome: "cozinha" | "arsenal" | "arquivo" | "guarda";
  readonly estado: "concluida" | "falhou" | "pendente" | "ignorada";
  readonly detalhe: string;
}

export interface ResultadoPreparacao {
  readonly estado: "pronta" | "parcial";
  readonly etapas: readonly EtapaPreparacao[];
}
