import type { Expressao, Contexto } from "./expressoes.js";
import { ContextoArcano } from "./expressoes.js";
import { ErroPrograma, MAX_OPERACOES } from "./limites.js";
import { analisar } from "./parser.js";

export function executar(expressao: Expressao, contexto: Contexto, limite: number = MAX_OPERACOES): void {
  if (!Number.isSafeInteger(limite) || limite < 1 || limite > MAX_OPERACOES) throw new Error("Orçamento deve ser inteiro de 1 a 64.");
  const custo = expressao.operacoes();
  if (!Number.isSafeInteger(custo) || custo < 1 || custo > limite) {
    throw new ErroPrograma("ORCAMENTO", 0, `Custo ${custo} excede orçamento ou contrato de operações ${limite}`);
  }
  expressao.interpretar(contexto);
}
export function conjurar(texto: string, contexto: ContextoArcano) {
  const expressao = analisar(texto); // Toda análise termina antes de receber o contexto na execução.
  executar(expressao, contexto);
  return contexto.snapshot();
}
