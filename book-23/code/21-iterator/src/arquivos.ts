import type { ArquivoOrdens, IteradorOrdens, Ordem } from "./contratos.js";
import { copiarOrdem } from "./contratos.js";
import { PercursoSnapshot } from "./percurso.js";

export class ArquivoEmLista implements ArquivoOrdens {
  readonly #ordens: Ordem[] = [];
  adicionar(entrada: Ordem): void {
    const ordem = copiarOrdem(entrada);
    if (this.#ordens.some((item) => item.id === ordem.id)) throw new Error("Id já existe.");
    this.#ordens.push(ordem);
  }
  atualizar(entrada: Ordem): void {
    const ordem = copiarOrdem(entrada);
    const indice = this.#ordens.findIndex((item) => item.id === ordem.id);
    if (indice < 0) throw new Error("Id não encontrado.");
    this.#ordens[indice] = ordem;
  }
  criarPercurso(): IteradorOrdens { return new PercursoSnapshot(this.#ordens); }
}

type No = { ordem: Ordem; proximo: No | null };

export class ArquivoEncadeado implements ArquivoOrdens {
  #primeiro: No | null = null;
  #ultimo: No | null = null;
  adicionar(entrada: Ordem): void {
    const ordem = copiarOrdem(entrada);
    if (this.#encontrar(ordem.id)) throw new Error("Id já existe.");
    const novo: No = { ordem, proximo: null };
    if (this.#ultimo) this.#ultimo.proximo = novo;
    else this.#primeiro = novo;
    this.#ultimo = novo;
  }
  atualizar(entrada: Ordem): void {
    const ordem = copiarOrdem(entrada);
    const no = this.#encontrar(ordem.id);
    if (!no) throw new Error("Id não encontrado.");
    no.ordem = ordem;
  }
  criarPercurso(): IteradorOrdens {
    const ordens: Ordem[] = [];
    for (let no = this.#primeiro; no !== null; no = no.proximo) ordens.push(no.ordem);
    return new PercursoSnapshot(ordens);
  }
  #encontrar(id: number): No | null {
    for (let no = this.#primeiro; no !== null; no = no.proximo) if (no.ordem.id === id) return no;
    return null;
  }
}
