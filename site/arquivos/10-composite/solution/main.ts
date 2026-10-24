import { Formacao, Soldado } from "../src/arvore.js";
import { FormacaoEditavel } from "./formacao-editavel.js";

const origem = new FormacaoEditavel("Origem");
const destino = new Formacao("Destino");
const pelotao = new Formacao("Pelotão");
pelotao.adicionar(new Soldado("Alaric"));
origem.adicionar(pelotao);
origem.adicionar(new Soldado("Elora"));
console.log(`Remoção presente: ${origem.remover(pelotao)}`);
console.log(`Remoção repetida: ${origem.remover(pelotao)}`);
destino.adicionar(pelotao);
console.log(`Origem: ${origem.executarOrdem("recuar").map((evento) => evento.nome).join(" -> ")}`);
console.log(`Destino: ${destino.executarOrdem("recuar").map((evento) => evento.nome).join(" -> ")}`);
