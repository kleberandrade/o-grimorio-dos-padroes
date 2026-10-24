import type { Guerreiro, Mago, Arqueiro } from "./membros.js";

export interface Visitante<R> {
  visitarGuerreiro(membro: Guerreiro): R;
  visitarMago(membro: Mago): R;
  visitarArqueiro(membro: Arqueiro): R;
}
export interface MembroGuilda {
  readonly nome: string;
  aceitar<R>(visitante: Visitante<R>): R;
}

export function nomeValido(nome: string): string {
  if (typeof nome !== "string" || !nome.trim()) throw new Error("Nome não vazio obrigatório.");
  return nome.trim();
}
export function indiceValido(valor: number): number {
  if (!Number.isInteger(valor) || valor < 0 || valor > 100) throw new Error("Índice deve ser inteiro entre zero e cem.");
  return valor;
}
export function somarPontos(total: number, valor: number): number {
  if (!Number.isSafeInteger(valor) || valor < 0 || !Number.isSafeInteger(total + valor)) throw new Error("Resultado numérico fora do contrato.");
  return total + valor;
}
