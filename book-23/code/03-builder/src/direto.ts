import type { FichaDePersonagem } from "./contratos.js";
import { validarECopiarFicha } from "./validacao.js";

// Alternativa sem Builder: suficiente quando todos os dados já estão disponíveis.
export function criarFichaDireta(opcoes: FichaDePersonagem): FichaDePersonagem {
  return validarECopiarFicha(opcoes);
}
