import { montarCasaDeControle } from "../src/composicao.js";
import type { Registro } from "../src/contratos.js";
import { obterRegistroCompartilhado } from "../src/modulo-compartilhado.js";

// A raiz escolhe o ciclo de vida padrão; os serviços continuam sem acesso global.
export function iniciarCasa(registro: Registro = obterRegistroCompartilhado()) {
  return montarCasaDeControle(registro);
}
