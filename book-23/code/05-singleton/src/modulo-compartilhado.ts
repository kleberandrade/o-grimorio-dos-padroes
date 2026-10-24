import type { Registro } from "./contratos.js";
import { RegistroEmMemoria } from "./registro.js";

// Uma instância por avaliação deste módulo neste contexto JavaScript.
let registro: Registro | undefined;

export function obterRegistroCompartilhado(): Registro {
  registro ??= new RegistroEmMemoria();
  return registro;
}
