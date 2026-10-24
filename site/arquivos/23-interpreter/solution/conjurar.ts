import { ContextoArcano } from "../src/expressoes.js";
import { executar } from "../src/executar.js";
import { analisarRepeticoes } from "./parser-ampliado.js";
export function conjurarRepeticoes(texto: string, contexto: ContextoArcano) {
  const expressao = analisarRepeticoes(texto);
  executar(expressao, contexto);
  return contexto.snapshot();
}
