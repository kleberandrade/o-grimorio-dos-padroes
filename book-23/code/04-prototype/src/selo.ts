import { textoObrigatorio } from "./validacao.js";

export class SeloDeProcedencia {
  readonly codigo: string;
  readonly origem: string;

  constructor(codigo: string, origem: string) {
    this.codigo = textoObrigatorio(codigo, "Código do selo");
    this.origem = textoObrigatorio(origem, "Origem do selo");
    Object.freeze(this);
  }
}
