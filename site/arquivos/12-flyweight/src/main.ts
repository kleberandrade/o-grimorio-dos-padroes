import { Aparicao, GuildaDosEspiritos } from "./espiritos.js";

const guilda = new GuildaDosEspiritos();
const primeira = new Aparicao(guilda.obter("fogo"), { x: 12, y: 56 });
const segunda = new Aparicao(guilda.obter("gelo"), { x: 44, y: 9 });
const terceira = new Aparicao(guilda.obter("fogo"), { x: 73, y: 20 });
for (const aparicao of [primeira, segunda, terceira]) {
  const dados = aparicao.descrever();
  console.log(`${dados.tipo} (${dados.cor}) em [${dados.x}, ${dados.y}]`);
}
console.log(`Fogo compartilha identidade: ${primeira.essencia === terceira.essencia}`);
primeira.moverPara({ x: 13, y: 57 });
console.log(`Primeira movida: [${primeira.descrever().x}, ${primeira.descrever().y}]`);
console.log(`Terceira preservada: [${terceira.descrever().x}, ${terceira.descrever().y}]`);
console.log(`Essências na fábrica: ${guilda.quantidadeEssencias()}`);
for (const tipo of ["constructor", "__proto__", "sombra"]) {
  try { guilda.obter(tipo); }
  catch (erro: unknown) {
    if (!(erro instanceof Error)) throw erro;
    console.log(`Recusado: ${erro.message}`);
  }
}
