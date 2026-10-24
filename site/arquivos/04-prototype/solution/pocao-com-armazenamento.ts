import type { Ingrediente } from "../src/contratos.js";
import { Pocao } from "../src/pocao.js";
import type { SeloDeProcedencia } from "../src/selo.js";
import { textoObrigatorio, validarNovoLote } from "../src/validacao.js";

export interface Armazenamento {
  limiteGraus: number;
  etiquetas: string[];
}

function copiarArmazenamento(dados: Armazenamento): Armazenamento {
  if (!Number.isFinite(dados.limiteGraus)) throw new Error("Limite de armazenamento deve ser finito.");
  return { limiteGraus: dados.limiteGraus, etiquetas: dados.etiquetas.map((item) => textoObrigatorio(item, "Etiqueta")) };
}

export class PocaoComArmazenamento extends Pocao {
  #armazenamento: Armazenamento;

  constructor(lote: string, ingredientes: readonly Ingrediente[], selo: SeloDeProcedencia, armazenamento: Armazenamento) {
    super(lote, ingredientes, selo);
    this.#armazenamento = copiarArmazenamento(armazenamento);
  }

  override clone(novoLote: string): PocaoComArmazenamento {
    return new PocaoComArmazenamento(
      validarNovoLote(this.lote, novoLote),
      this.consultarIngredientes(),
      this.selo,
      this.#armazenamento,
    );
  }

  definirLimite(limiteGraus: number): void {
    this.#armazenamento = copiarArmazenamento({ ...this.#armazenamento, limiteGraus });
  }

  adicionarEtiqueta(etiqueta: string): void {
    this.#armazenamento.etiquetas.push(textoObrigatorio(etiqueta, "Etiqueta"));
  }

  consultarArmazenamento(): Armazenamento {
    return copiarArmazenamento(this.#armazenamento);
  }
}
