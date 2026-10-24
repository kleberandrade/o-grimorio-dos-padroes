export type Turno = "dia" | "noite";
export type AcaoDeComporta = "abrir" | "fechar";

export interface OrdemDeComporta {
  readonly equipe: string;
  readonly comporta: string;
  readonly acao: AcaoDeComporta;
  readonly turno: Turno;
}

export interface Registro {
  registrar(ordem: OrdemDeComporta): void;
  listarOrdens(): readonly OrdemDeComporta[];
}
