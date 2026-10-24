import type { Guerreiro, Mago, Arqueiro, Curandeiro } from "./membros-ampliados.js";
import type { VisitanteAmpliado, MembroAmpliado } from "./contratos-ampliados.js";
import { somarPontos } from "../src/contratos.js";

export class CalcularCapacidade implements VisitanteAmpliado<number> {
  visitarGuerreiro(membro: Guerreiro): number { return membro.forca * 2; }
  visitarMago(membro: Mago): number { return membro.mana * 3; }
  visitarArqueiro(membro: Arqueiro): number { return membro.pontaria * 2; }
  visitarCurandeiro(membro: Curandeiro): number { return membro.cuidado * 2; }
}
export class CalcularCusto implements VisitanteAmpliado<number> {
  visitarGuerreiro(membro: Guerreiro): number { return membro.forca + 10; }
  visitarMago(membro: Mago): number { return membro.mana * 2 + 5; }
  visitarArqueiro(membro: Arqueiro): number { return membro.pontaria + 15; }
  visitarCurandeiro(membro: Curandeiro): number { return membro.cuidado * 3 + 8; }
}
export function totalizar(membros: readonly MembroAmpliado[], visitante: VisitanteAmpliado<number>): number {
  return membros.reduce((total, membro) => somarPontos(total, membro.aceitar(visitante)), 0);
}
