export interface Aviso { readonly mensagem: string; readonly local: string; }
export type Observador = (aviso: Aviso) => void;
export type Desligar = () => boolean;
export type Reacao = Readonly<{ nome: string; status: "concluiu" }>
  | Readonly<{ nome: string; status: "falhou"; motivo: string }>;
export interface Relatorio { readonly aviso: Aviso; readonly reacoes: readonly Reacao[]; }
type Inscricao = Readonly<{ nome: string; observar: Observador }>;

function texto(valor: string, campo: string): string {
  if (!valor.trim()) throw new Error(`${campo} obrigatório.`);
  return valor.trim();
}

function motivoDaFalha(erro: unknown): string {
  try {
    if (erro instanceof Error) {
      const mensagem: unknown = erro.message;
      if (typeof mensagem === "string") return mensagem;
    }
    return "Falha sem mensagem de Error.";
  } catch {
    return "Falha ao ler mensagem do erro.";
  }
}

export class Oraculo {
  readonly #inscritos = new Map<Observador, Inscricao>();
  #emitindo = false;

  inscrever(nome: string, observar: Observador): Desligar {
    const rotulo = texto(nome, "Nome");
    if (typeof observar !== "function") throw new Error("Observador deve ser função.");
    if (this.#inscritos.has(observar)) throw new Error("Observador já inscrito.");
    const inscricao = Object.freeze({ nome: rotulo, observar });
    this.#inscritos.set(observar, inscricao);
    return () => {
      if (this.#inscritos.get(observar) !== inscricao) return false;
      this.#inscritos.delete(observar);
      return true;
    };
  }

  numeroInscricoes(): number { return this.#inscritos.size; }

  emitir(aviso: Aviso): Relatorio {
    if (this.#emitindo) throw new Error("Emissão reentrante recusada neste oráculo.");
    const copia = Object.freeze({ mensagem: texto(aviso.mensagem, "Mensagem"), local: texto(aviso.local, "Local") });
    const rodada = [...this.#inscritos.values()];
    const reacoes: Reacao[] = [];
    this.#emitindo = true;
    try {
      for (const inscricao of rodada) {
        try {
          inscricao.observar(copia);
          reacoes.push(Object.freeze({ nome: inscricao.nome, status: "concluiu" }));
        } catch (erro: unknown) {
          reacoes.push(Object.freeze({ nome: inscricao.nome, status: "falhou",
            motivo: motivoDaFalha(erro) }));
        }
      }
      return Object.freeze({ aviso: copia, reacoes: Object.freeze(reacoes) });
    } finally {
      this.#emitindo = false;
    }
  }
}
