import { Arco, Espada } from "./armas.js";
import { EssenciaFogo, EssenciaGelo } from "./essencias.js";

for (const Forma of [Espada, Arco]) {
  for (const essencia of [new EssenciaFogo(), new EssenciaGelo()]) {
    const resultado = new Forma(essencia).empunhar({ nucleoMolhado: false });
    console.log(`${resultado.forma} + ${resultado.essencia}: ${resultado.estado} | custo ${resultado.custo} | ${resultado.efeitos.join(" -> ")}`);
  }
}

const fogo = new EssenciaFogo();
const gelo = new EssenciaGelo();
const espada = new Espada(fogo);
const mesmaArma = espada;
espada.trocarEssencia(gelo);
const trocada = espada.empunhar({ nucleoMolhado: true });
console.log(`Troca: mesma arma ${espada === mesmaArma} | mesma essência injetada ${espada.essenciaAtual() === gelo} | custo ${trocada.custo}`);

const bloqueado = new Espada(fogo).empunhar({ nucleoMolhado: true });
if (bloqueado.estado === "bloqueado") console.log(`Núcleo molhado com fogo: ${bloqueado.estado} | custo ${bloqueado.custo} | ${bloqueado.motivo}`);
