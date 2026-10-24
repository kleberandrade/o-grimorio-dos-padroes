import { construirCenario, conferirCenario } from "../experiment/cenario.js";
import type { TipoEspirito } from "../src/espiritos.js";

for (const tipos of [["fogo"], ["fogo", "gelo", "vento"]] satisfies TipoEspirito[][]) {
  const parametros = { contagem: 6, tipos };
  const independente = conferirCenario(construirCenario("sem-compartilhar", parametros));
  const compartilhado = conferirCenario(construirCenario("flyweight", parametros));
  console.log(`Tipos ${tipos.length}: sem compartilhar ${independente.essenciasUnicas} essências | Flyweight ${compartilhado.essenciasUnicas} | dados iguais ${independente.dadosSha256 === compartilhado.dadosSha256}`);
}
