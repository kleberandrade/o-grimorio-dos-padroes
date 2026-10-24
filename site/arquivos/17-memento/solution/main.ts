import { Diario } from "../src/diario.js";
import { LinhaDoTempo } from "./linha-do-tempo.js";

const estado = (conteudo: string) => ({ conteudo, contexto: { local: "Chronoria", marcadores: ["rascunho"] } });
const diario = new Diario(estado("A"));
const linha = new LinhaDoTempo(diario.portaMemorias(), 3);
diario.substituir(estado("B"));
try { linha.undo(); }
catch (erro: unknown) { console.log(erro instanceof Error ? erro.message : "Erro desconhecido."); }
linha.confirmar("B");
diario.substituir(estado("C"));
linha.confirmar("C");
linha.undo();
console.log(`Undo: ${diario.ler().conteudo}`);
linha.redo();
console.log(`Redo: ${diario.ler().conteudo}`);
linha.undo();
diario.substituir(estado("D"));
linha.confirmar("D");
console.log(`Nova ramificação: ${diario.ler().conteudo} | redo: ${linha.redo()}`);
console.log(`Checkpoints: ${linha.listar().map((item) => item.rotulo).join(", ")}`);
