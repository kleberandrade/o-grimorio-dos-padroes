import { Formacao } from "../src/arvore.js";
import type { NoDaArvore } from "../src/arvore.js";

export class FormacaoEditavel extends Formacao {
  remover(unidade: NoDaArvore): boolean {
    return this.desvincularMembro(unidade);
  }
}
