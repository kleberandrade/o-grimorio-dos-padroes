import { ArquivoEmLista, ArquivoEncadeado } from "./arquivos.js";
import { demonstrarNativo } from "./nativo.js";

const nativo = demonstrarNativo();
console.log(`Array nativo com for...of: ${nativo.porProtocolo.join(", ")}`);
console.log(`Chamadas a Symbol.iterator: após forEach/map ${nativo.aposCallbacks} | após for...of ${nativo.aposForOf}`);
for (const [nome, arquivo] of [["Lista", new ArquivoEmLista()], ["Encadeado", new ArquivoEncadeado()]] as const) {
  arquivo.adicionar({ id: 2, descricao: "Retirada registrada" });
  arquivo.adicionar({ id: 1, descricao: "Endereço de abrigo anotado" });
  const suri = arquivo.criarPercurso();
  const neri = arquivo.criarPercurso();
  arquivo.adicionar({ id: 3, descricao: "Registro posterior" });
  const primeiro = suri.proximo();
  const segundo = suri.proximo();
  const independente = neri.proximo();
  console.log(`${nome}: Suri ${primeiro.fim ? "fim" : primeiro.ordem.id}, ${segundo.fim ? "fim" : segundo.ordem.id} | Neri ${independente.fim ? "fim" : independente.ordem.id}`);
  console.log(`${nome}: fim do snapshot ${suri.proximo().fim}`);
}
