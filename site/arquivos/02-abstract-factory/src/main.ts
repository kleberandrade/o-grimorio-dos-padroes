import { FabricaDeBrasa } from "./brasa.js";
import { ensaiarKit } from "./cliente.js";
import { FabricaDeGeada } from "./geada.js";

// A seleção concreta fica no ponto de composição, fora do cliente.
for (const fabrica of [new FabricaDeBrasa(), new FabricaDeGeada()]) {
  const resultado = ensaiarKit(fabrica, 3);
  console.log(`${resultado.afinidade} | ${resultado.arma} + ${resultado.protecao} | intensidade ${resultado.intensidade} | compatível`);
}

const arma = new FabricaDeBrasa().criarArma();
const protecao = new FabricaDeGeada().criarProtecao();
try {
  protecao.ensaiar(arma.emitirPulso(3));
} catch (erro: unknown) {
  if (!(erro instanceof Error)) throw erro;
  console.log(`Mistura rejeitada: ${erro.message}`);
}
