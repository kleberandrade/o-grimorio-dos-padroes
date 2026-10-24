import type { Contexto, Simbolo } from "./expressoes.js";
export function aplicarComando(simbolo: Simbolo, contexto: Contexto): void {
  switch (simbolo) {
    case "F": contexto.registrar("F"); return;
    case "I": contexto.registrar("I"); return;
    case "L": contexto.registrar("L"); return;
    default: throw new Error("Comando simples desconhecido.");
  }
}
