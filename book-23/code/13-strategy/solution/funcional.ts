import type { Alvo, ResultadoAtaque } from "../src/contratos.js";
import { executado, inadequado, normalizarAlvo, normalizarNome } from "../src/resultado.js";

export type EstrategiaFuncional = (alvo: Alvo) => ResultadoAtaque;

export const ataqueArcoFuncao: EstrategiaFuncional = (entrada) => {
  const alvo = normalizarAlvo(entrada);
  if (alvo.distanciaMetros < 2 || alvo.distanciaMetros > 30) return inadequado("arco", alvo, "Fora do intervalo de 2 a 30 m.");
  if (alvo.resistencia === "reforcada") return inadequado("arco", alvo, "Resistência reforçada exige outra técnica.");
  return executado("arco", alvo, 2, "disparo à distância");
};

export function criarContextoFuncional(nome: string, estrategia: EstrategiaFuncional) {
  const identidade = normalizarNome(nome);
  let atual = estrategia;
  return Object.freeze({
    nome: identidade,
    trocarEstrategia: (nova: EstrategiaFuncional): void => { atual = nova; },
    atacar: (alvo: Alvo): ResultadoAtaque => atual(normalizarAlvo(alvo)),
  });
}
