import type { ContextoUso, Essencia, ResultadoUso } from "./contratos.js";

function validarCusto(custo: number): void {
  if (!Number.isSafeInteger(custo) || custo < 0) {
    throw new Error("Custo deve ser inteiro seguro não negativo.");
  }
}

export function resolverUso(
  forma: string,
  gesto: string,
  custoBase: number,
  essencia: Essencia,
  contexto: ContextoUso,
): ResultadoUso {
  const ativacao = essencia.ativar(contexto);
  if (ativacao.estado === "bloqueada") {
    return Object.freeze({ estado: "bloqueado", forma, essencia: essencia.nome, custo: 0,
      efeitos: Object.freeze([]), motivo: ativacao.motivo });
  }
  validarCusto(custoBase);
  validarCusto(ativacao.custo);
  const custo = custoBase + ativacao.custo;
  validarCusto(custo);
  return Object.freeze({ estado: "executado", forma, essencia: essencia.nome, custo,
    efeitos: Object.freeze([gesto, ativacao.efeito]) });
}
