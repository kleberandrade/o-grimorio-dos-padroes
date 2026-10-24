import type { MembroGuilda, Visitante } from "./contratos.js";
import { nomeValido, indiceValido } from "./contratos.js";

export class Guerreiro implements MembroGuilda {
  readonly nome: string;
  readonly forca: number;
  constructor(nome: string, forca: number) { this.nome = nomeValido(nome); this.forca = indiceValido(forca); Object.freeze(this); }
  aceitar<R>(visitante: Visitante<R>): R { return visitante.visitarGuerreiro(this); }
}
export class Mago implements MembroGuilda {
  readonly nome: string;
  readonly mana: number;
  constructor(nome: string, mana: number) { this.nome = nomeValido(nome); this.mana = indiceValido(mana); Object.freeze(this); }
  aceitar<R>(visitante: Visitante<R>): R { return visitante.visitarMago(this); }
}
export class Arqueiro implements MembroGuilda {
  readonly nome: string;
  readonly pontaria: number;
  constructor(nome: string, pontaria: number) { this.nome = nomeValido(nome); this.pontaria = indiceValido(pontaria); Object.freeze(this); }
  aceitar<R>(visitante: Visitante<R>): R { return visitante.visitarArqueiro(this); }
}
