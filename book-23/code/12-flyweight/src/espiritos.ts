export type TipoEspirito = "fogo" | "gelo" | "vento";
export interface Posicao { readonly x: number; readonly y: number; }
export interface DescricaoAparicao extends Posicao {
  readonly tipo: TipoEspirito;
  readonly cor: string;
}

export function validarTipo(tipo: string): TipoEspirito {
  if (tipo !== "fogo" && tipo !== "gelo" && tipo !== "vento") {
    throw new Error(`Tipo de espírito não suportado: ${tipo}.`);
  }
  return tipo;
}

function corDoTipo(tipo: TipoEspirito): string {
  switch (tipo) {
    case "fogo": return "vermelho";
    case "gelo": return "azul";
    case "vento": return "branco";
  }
}

function copiarPosicao(posicao: Posicao): Posicao {
  if (!Number.isFinite(posicao.x) || !Number.isFinite(posicao.y)) {
    throw new Error("Coordenadas devem ser finitas.");
  }
  return Object.freeze({ x: posicao.x, y: posicao.y });
}

// Flyweight: somente o estado intrínseco, realmente congelado em execução.
export class EssenciaEspirito {
  readonly tipo: TipoEspirito;
  readonly cor: string;

  constructor(tipo: TipoEspirito) {
    this.tipo = validarTipo(tipo);
    this.cor = corDoTipo(this.tipo);
    Object.freeze(this);
  }

  descrever(posicao: Posicao): DescricaoAparicao {
    return Object.freeze({ tipo: this.tipo, cor: this.cor, ...copiarPosicao(posicao) });
  }
}

export class GuildaDosEspiritos {
  readonly #essencias = new Map<TipoEspirito, EssenciaEspirito>();

  obter(tipo: string): EssenciaEspirito {
    const suportado = validarTipo(tipo);
    let essencia = this.#essencias.get(suportado);
    if (!essencia) {
      essencia = new EssenciaEspirito(suportado);
      this.#essencias.set(suportado, essencia);
    }
    return essencia;
  }

  quantidadeEssencias(): number { return this.#essencias.size; }
}

// Context: cada ocorrência mantém seu próprio estado extrínseco.
export class Aparicao {
  readonly #essencia: EssenciaEspirito;
  #posicao: Posicao;

  constructor(essencia: EssenciaEspirito, posicao: Posicao) {
    if (!Object.isFrozen(essencia)) throw new Error("Essência compartilhada deve estar congelada.");
    this.#essencia = essencia;
    this.#posicao = copiarPosicao(posicao);
  }

  get essencia(): EssenciaEspirito { return this.#essencia; }
  moverPara(posicao: Posicao): void { this.#posicao = copiarPosicao(posicao); }
  descrever(): DescricaoAparicao { return this.#essencia.descrever(this.#posicao); }
}
