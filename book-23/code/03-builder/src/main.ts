import { PersonagemBuilder, RelatorioBuilder } from "./builders.js";
import { DiretorDeResgate } from "./diretor.js";

const diretor = new DiretorDeResgate();
const builder = new PersonagemBuilder();
diretor.prepararTorre(builder, "Ivo");
const torre = builder.build();
diretor.prepararGaleria(builder, "Bia");
const galeria = builder.build();

console.log(`Ficha torre: ${torre.nome} | ${torre.equipamentos.map((item) => item.nome).join(", ")}`);
console.log(`Ficha galeria: ${galeria.nome} | ${galeria.equipamentos.map((item) => item.nome).join(", ")}`);
console.log(`Ficha anterior preservada: ${torre.nome} | missão ${torre.missao}`);

const relatorio = new RelatorioBuilder();
diretor.prepararTorre(relatorio, "Ivo");
console.log(`Relatório: ${relatorio.build()}`);

try {
  new PersonagemBuilder().definirIdentidade("Ivo", "resgatista")
    .definirVida(100).definirMissao("torre").build();
} catch (erro: unknown) {
  if (!(erro instanceof Error)) throw erro;
  console.log(`Ficha incompleta rejeitada: ${erro.message}`);
}
