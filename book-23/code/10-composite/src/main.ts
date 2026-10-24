import { Formacao, Soldado } from "./arvore.js";

const pelotao = new Formacao("Pelotão do Norte");
pelotao.adicionar(new Soldado("Alaric"));
pelotao.adicionar(new Soldado("Elora"));
const formacao = new Formacao("Formação de Mirralis");
formacao.adicionar(pelotao);
formacao.adicionar(new Soldado("Lorn"));

for (const evento of formacao.executarOrdem("recuar")) {
  console.log(`${evento.tipo === "formacao" ? "Formação" : "Soldado"}: ${evento.nome} | ordem ${evento.ordem}`);
}
