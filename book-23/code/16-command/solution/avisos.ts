import type { Comando } from "../src/comando.js";

export interface PortaAvisos {
  emitir(texto: string): number;
  compensar(aviso: number): number;
}
export interface RegistroAviso {
  readonly id: number;
  readonly tipo: "aviso" | "compensacao";
  readonly texto: string;
  readonly referencia: number | null;
}

// Simulação local em memória. Nenhuma rede ou mensagem real é enviada.
export class AvisosSimulados implements PortaAvisos {
  readonly #registros: RegistroAviso[] = [];
  #recusarProxima = false;
  falharProximaCompensacao(): void { this.#recusarProxima = true; }

  emitir(texto: string): number {
    if (!texto.trim()) throw new Error("Aviso sem texto.");
    return this.#registrar("aviso", texto.trim(), null);
  }

  compensar(aviso: number): number {
    if (!this.#registros.some((registro) => registro.id === aviso && registro.tipo === "aviso")) {
      throw new Error("Aviso original não encontrado.");
    }
    if (this.#recusarProxima) {
      this.#recusarProxima = false;
      throw new Error("Falha simulada antes de registrar compensação.");
    }
    return this.#registrar("compensacao", "Desconsidere o aviso referenciado.", aviso);
  }

  listar(): readonly RegistroAviso[] { return [...this.#registros]; }

  #registrar(tipo: RegistroAviso["tipo"], texto: string, referencia: number | null): number {
    const id = this.#registros.length + 1;
    this.#registros.push(Object.freeze({ id, tipo, texto, referencia }));
    return id;
  }
}

export class ComandoAvisar implements Comando {
  readonly #porta: PortaAvisos;
  readonly #texto: string;
  #aviso: number | null = null;
  #compensado = false;

  constructor(porta: PortaAvisos, texto: string) {
    if (!texto.trim()) throw new Error("Aviso sem texto.");
    this.#porta = porta;
    this.#texto = texto.trim();
  }
  get descricao(): string { return `avisar: ${this.#texto}`; }

  executar(): void {
    if (this.#aviso !== null) throw new Error("Aviso deste comando já emitido.");
    this.#aviso = this.#porta.emitir(this.#texto);
  }

  // O nome vem do contrato do invocador; o efeito aqui é compensar, não apagar.
  desfazer(): void {
    if (this.#aviso === null || this.#compensado) throw new Error("Não há aviso ativo deste comando para compensar.");
    this.#porta.compensar(this.#aviso);
    this.#compensado = true;
  }
}
