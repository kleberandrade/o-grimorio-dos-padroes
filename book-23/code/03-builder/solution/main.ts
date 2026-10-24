import { PersonagemBuilder, RelatorioBuilder } from "../src/builders.js";
import { criarGaleriaComFiltroDireta, prepararGaleriaComFiltro } from "./protecao-especial.js";

const ficha = new PersonagemBuilder();
prepararGaleriaComFiltro(ficha, "Bia");
const relatorio = new RelatorioBuilder();
prepararGaleriaComFiltro(relatorio, "Bia");
console.log(`Proteção especial: ${ficha.build().equipamentos.at(-1)?.protecoes.join(", ")}`);
console.log(`Relatório: ${relatorio.build()}`);
console.log(`Alternativa direta: ${criarGaleriaComFiltroDireta("Bia").equipamentos.length} equipamentos`);
