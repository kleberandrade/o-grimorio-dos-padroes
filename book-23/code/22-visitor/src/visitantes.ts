import type { Guerreiro, Mago, Arqueiro } from "./membros.js";
import type { Visitante, MembroGuilda } from "./contratos.js";
import { somarPontos } from "./contratos.js";

export class CalcularCapacidade implements Visitante<number> {
  visitarGuerreiro(membro: Guerreiro): number { return membro.forca * 2; }
  visitarMago(membro: Mago): number { return membro.mana * 3; }
  visitarArqueiro(membro: Arqueiro): number { return membro.pontaria * 2; }
}
export class CalcularCusto implements Visitante<number> {
  visitarGuerreiro(membro: Guerreiro): number { return membro.forca + 10; }
  visitarMago(membro: Mago): number { return membro.mana * 2 + 5; }
  visitarArqueiro(membro: Arqueiro): number { return membro.pontaria + 15; }
}
export function totalizar(membros: readonly MembroGuilda[], visitante: Visitante<number>): number {
  return membros.reduce((total, membro) => somarPontos(total, membro.aceitar(visitante)), 0);
}
