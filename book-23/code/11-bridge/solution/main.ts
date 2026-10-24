import { Arco, Espada } from "../src/armas.js";
import { EssenciaFogo, EssenciaGelo } from "../src/essencias.js";
import { Escudo, EssenciaVento } from "./extensoes.js";

const armas = [new Espada(new EssenciaVento()), new Arco(new EssenciaVento()),
  new Escudo(new EssenciaFogo()), new Escudo(new EssenciaGelo()), new Escudo(new EssenciaVento())];
for (const arma of armas) {
  const resultado = arma.empunhar({ nucleoMolhado: false });
  console.log(`${resultado.forma} + ${resultado.essencia}: ${resultado.estado} | custo ${resultado.custo} | ${resultado.efeitos.join(" -> ")}`);
}
