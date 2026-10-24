import { ArquivoEmLista } from "../src/arquivos.js";
import { ArquivoIterable, gerarSnapshot } from "./iteravel.js";

const arquivo = new ArquivoEmLista();
arquivo.adicionar({ id: 1, descricao: "Primeira" });
arquivo.adicionar({ id: 2, descricao: "Segunda" });
const iteravel = new ArquivoIterable(arquivo);
const nativo = iteravel[Symbol.iterator]();
const gerador = gerarSnapshot(arquivo);
arquivo.adicionar({ id: 3, descricao: "Posterior à criação" });
console.log(`Ponte criada antes de mutar: ${[...nativo].map((ordem) => ordem.id).join(", ")}`);
console.log(`Gerador criado antes de mutar: ${[...gerador].map((ordem) => ordem.id).join(", ")}`);
const interrompido = iteravel[Symbol.iterator]();
for (const ordem of interrompido) { console.log(`Antes de break: ${ordem.id}`); break; }
console.log(`Instância interrompida: done ${interrompido.next().done}`);
console.log(`Novo iterador: ${[...iteravel].map((ordem) => ordem.id).join(", ")}`);
