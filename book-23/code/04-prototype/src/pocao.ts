import type { Ingrediente, PocaoPrototype } from "./contratos.js";
import type { SeloDeProcedencia } from "./selo.js";
import { copiarIngrediente, textoObrigatorio, validarNovoLote, validarQuantidade } from "./validacao.js";

export class Pocao implements PocaoPrototype {
  readonly #lote: string;
  readonly #selo: SeloDeProcedencia;
  #ingredientes: Ingrediente[] = [];

  constructor(lote: string, ingredientes: readonly Ingrediente[], selo: SeloDeProcedencia) {
    this.#lote = textoObrigatorio(lote, "Lote");
    if (!Object.isFrozen(selo)) throw new Error("Selo compartilhado deve estar congelado.");
    this.#selo = selo;
    if (ingredientes.length === 0) throw new Error("Ao menos um ingrediente obrigatório.");
    for (const ingrediente of ingredientes) this.adicionarIngrediente(ingrediente);
  }

  get lote(): string { return this.#lote; }
  get selo(): SeloDeProcedencia { return this.#selo; }

  clone(novoLote: string): Pocao {
    const lote = validarNovoLote(this.#lote, novoLote);
    // O construtor copia os ingredientes; somente o selo congelado é compartilhado.
    return new Pocao(lote, this.#ingredientes, this.#selo);
  }

  ajustarQuantidade(nome: string, quantidade: number): void {
    validarQuantidade(quantidade);
    this.buscarIngrediente(nome).dose.quantidade = quantidade;
  }

  anotarIngrediente(nome: string, nota: string): void {
    this.buscarIngrediente(nome).observacoes.push(textoObrigatorio(nota, "Observação"));
  }

  adicionarIngrediente(ingrediente: Ingrediente): void {
    const copia = copiarIngrediente(ingrediente);
    if (this.#ingredientes.some((item) => item.nome === copia.nome)) {
      throw new Error(`Ingrediente duplicado: ${copia.nome}.`);
    }
    this.#ingredientes.push(copia);
  }

  consultarIngredientes(): Ingrediente[] {
    return this.#ingredientes.map(copiarIngrediente);
  }

  descrever(): string {
    const doses = this.#ingredientes.map((item) => `${item.nome}: ${item.dose.quantidade} ${item.dose.unidade}`).join("; ");
    return `${this.#lote} | ${doses} | selo ${this.#selo.codigo}`;
  }

  private buscarIngrediente(nome: string): Ingrediente {
    const procurado = textoObrigatorio(nome, "Nome do ingrediente");
    const ingrediente = this.#ingredientes.find((item) => item.nome === procurado);
    if (!ingrediente) throw new Error(`Ingrediente desconhecido: ${procurado}.`);
    return ingrediente;
  }
}
