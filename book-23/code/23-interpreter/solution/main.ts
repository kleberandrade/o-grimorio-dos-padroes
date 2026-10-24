import { ContextoArcano } from "../src/expressoes.js";
import { ErroPrograma } from "../src/limites.js";
import { conjurarRepeticoes } from "./conjurar.js";
const resultado = conjurarRepeticoes("(FI)*2L", new ContextoArcano());
console.log(`Repetição: ${resultado.sequencia.join("")} | calor ${resultado.calor} | frio ${resultado.frio} | luz ${resultado.luz}`);
const contexto = new ContextoArcano();
try { conjurarRepeticoes("((F*9)*9)", contexto); }
catch (erro: unknown) {
  if (!(erro instanceof ErroPrograma)) throw erro;
  console.log(`Recusado: ${erro.codigo} | posição global ${erro.posicao} | ${erro.causa}`);
}
console.log(`Efeitos acima do orçamento: ${contexto.snapshot().sequencia.length}`);
