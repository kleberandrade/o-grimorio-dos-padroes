import type { EventoOrdem, Unidade } from "./contratos.js";

function textoObrigatorio(texto: string, campo: string): string {
  const valor = texto.trim();
  if (!valor) throw new Error(`Campo obrigatório: ${campo}.`);
  return valor;
}

function evento(tipo: EventoOrdem["tipo"], nome: string, ordem: string): EventoOrdem {
  return Object.freeze({ tipo, nome, ordem });
}

export class Soldado implements Unidade {
  readonly #nome: string;

  constructor(nome: string) { this.#nome = textoObrigatorio(nome, "nome"); }

  executarOrdem(ordem: string): readonly EventoOrdem[] {
    return Object.freeze([evento("soldado", this.#nome, textoObrigatorio(ordem, "ordem"))]);
  }
}

// Gestão restrita aos nós fornecidos pelo projeto, não a qualquer grafo externo.
export type NoDaArvore = Soldado | Formacao;
const pais = new WeakMap<NoDaArvore, Formacao>();

export class Formacao implements Unidade {
  readonly #nome: string;
  #membros: NoDaArvore[] = [];

  constructor(nome: string) { this.#nome = textoObrigatorio(nome, "nome"); }

  adicionar(unidade: NoDaArvore): void {
    if (!(unidade instanceof Soldado || unidade instanceof Formacao)) {
      throw new Error("Nó não pertence ao modelo da árvore.");
    }
    if (unidade === this) throw new Error("Formação não pode conter a si mesma.");
    if (this.#membros.includes(unidade)) throw new Error("Unidade já pertence a esta formação.");
    for (let ancestral = pais.get(this); ancestral; ancestral = pais.get(ancestral)) {
      if (ancestral === unidade) throw new Error("Inclusão criaria ciclo com ancestral.");
    }
    if (pais.has(unidade)) throw new Error("Unidade já pertence a outra formação.");
    this.#membros.push(unidade);
    pais.set(unidade, this);
  }

  listarMembros(): readonly NoDaArvore[] {
    return [...this.#membros];
  }

  executarOrdem(ordem: string): readonly EventoOrdem[] {
    const normalizada = textoObrigatorio(ordem, "ordem");
    const relatorio = [evento("formacao", this.#nome, normalizada)];
    for (const membro of this.#membros) relatorio.push(...membro.executarOrdem(normalizada));
    return Object.freeze(relatorio);
  }

  // Ponto de extensão da variante editável: atualiza lista e vínculo juntos.
  protected desvincularMembro(unidade: NoDaArvore): boolean {
    const posicao = this.#membros.indexOf(unidade);
    if (posicao < 0) return false;
    this.#membros.splice(posicao, 1);
    pais.delete(unidade);
    return true;
  }
}
