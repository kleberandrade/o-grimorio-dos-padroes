import { ContextoArcano } from "./expressoes.js";
import { conjurar } from "./executar.js";
import { ErroPrograma } from "./limites.js";
import { aplicarComando } from "./simples.js";

const simples = new ContextoArcano(); aplicarComando("L", simples);
console.log(`Comando simples: ${simples.snapshot().sequencia.join("")}`);
const contexto = new ContextoArcano();
const resultado = conjurar("L(FI)L", contexto);
console.log(`Composição: ${resultado.sequencia.join("")} | calor ${resultado.calor} | frio ${resultado.frio} | luz ${resultado.luz}`);
const recusado = new ContextoArcano();
try { conjurar("FXL", recusado); }
catch (erro: unknown) {
  if (!(erro instanceof ErroPrograma)) throw erro;
  console.log(`Recusado: ${erro.codigo} | posição ${erro.posicao} | ${erro.causa}`);
}
console.log(`Efeitos do programa inválido: ${recusado.snapshot().sequencia.length}`);
