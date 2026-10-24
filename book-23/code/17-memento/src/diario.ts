export interface EstadoDiario {
  readonly conteudo: string;
  readonly contexto: Readonly<{ local: string; marcadores: readonly string[] }>;
}

declare const marcaMemoria: unique symbol;
export interface Memoria { readonly [marcaMemoria]: true; }

export interface PortaMemorias {
  salvar(): Memoria;
  restaurar(memoria: Memoria): void;
  correspondeCheckpoint(memoria: Memoria): boolean;
}

function copiar(estado: EstadoDiario): EstadoDiario {
  return Object.freeze({ conteudo: estado.conteudo,
    contexto: Object.freeze({ local: estado.contexto.local, marcadores: Object.freeze([...estado.contexto.marcadores]) }) });
}

type Captura = { readonly estado: EstadoDiario; readonly marca: object };

export class Diario {
  #estado: EstadoDiario;
  #marca: object = Object.freeze({});
  readonly #capturas = new WeakMap<Memoria, Captura>();

  constructor(inicial: EstadoDiario) { this.#estado = copiar(inicial); }
  substituir(estado: EstadoDiario): void {
    const copia = copiar(estado);
    this.#estado = copia;
    this.#marca = Object.freeze({});
  }
  ler(): EstadoDiario { return copiar(this.#estado); }

  salvar(): Memoria {
    // O token não tem campos: o estado só existe no WeakMap privado deste diário.
    const token = Object.freeze(Object.create(null)) as Memoria;
    this.#capturas.set(token, { estado: copiar(this.#estado), marca: this.#marca });
    return token;
  }

  restaurar(memoria: Memoria): void {
    const captura = this.#obter(memoria);
    this.#estado = copiar(captura.estado);
    this.#marca = captura.marca;
  }

  correspondeCheckpoint(memoria: Memoria): boolean {
    return this.#marca === this.#obter(memoria).marca;
  }

  // Wrapper real: esta referência não é o próprio Diario com uma interface estreitada.
  portaMemorias(): PortaMemorias {
    return Object.freeze({ salvar: () => this.salvar(),
      restaurar: (memoria: Memoria) => this.restaurar(memoria),
      correspondeCheckpoint: (memoria: Memoria) => this.correspondeCheckpoint(memoria) });
  }

  #obter(memoria: Memoria): Captura {
    const captura = this.#capturas.get(memoria);
    if (!captura) throw new Error("Memória inválida para este diário.");
    return captura;
  }
}
