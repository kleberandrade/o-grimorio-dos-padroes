import type { Guerreiro, Mago, Arqueiro, Curandeiro } from "./membros-ampliados.js";

export interface VisitanteAmpliado<R> {
  visitarGuerreiro(membro: Guerreiro): R;
  visitarMago(membro: Mago): R;
  visitarArqueiro(membro: Arqueiro): R;
  visitarCurandeiro(membro: Curandeiro): R;
}
export interface MembroAmpliado {
  readonly nome: string;
  aceitar<R>(visitante: VisitanteAmpliado<R>): R;
}

