import type { MembroAmpliado, VisitanteAmpliado } from "./contratos-ampliados.js";
import { nomeValido, indiceValido } from "../src/contratos.js";

export class Guerreiro implements MembroAmpliado {
  readonly nome: string;
  readonly forca: number;
  constructor(nome: string, forca: number) { this.nome = nomeValido(nome); this.forca = indiceValido(forca); Object.freeze(this); }
  aceitar<R>(visitante: VisitanteAmpliado<R>): R { return visitante.visitarGuerreiro(this); }
}
export class Mago implements MembroAmpliado {
  readonly nome: string;
  readonly mana: number;
  constructor(nome: string, mana: number) { this.nome = nomeValido(nome); this.mana = indiceValido(mana); Object.freeze(this); }
  aceitar<R>(visitante: VisitanteAmpliado<R>): R { return visitante.visitarMago(this); }
}
export class Arqueiro implements MembroAmpliado {
  readonly nome: string;
  readonly pontaria: number;
  constructor(nome: string, pontaria: number) { this.nome = nomeValido(nome); this.pontaria = indiceValido(pontaria); Object.freeze(this); }
  aceitar<R>(visitante: VisitanteAmpliado<R>): R { return visitante.visitarArqueiro(this); }
}

export class Curandeiro implements MembroAmpliado {
  readonly nome: string;
  readonly cuidado: number;
  constructor(nome: string, cuidado: number) { this.nome = nomeValido(nome); this.cuidado = indiceValido(cuidado); Object.freeze(this); }
  aceitar<R>(visitante: VisitanteAmpliado<R>): R { return visitante.visitarCurandeiro(this); }
}
