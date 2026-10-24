import { avisarGuilda } from "./cliente.js";
import { CorreioEmMemoria } from "./correio-em-memoria.js";
import { CriadorDeCristal, CriadorDePergaminho } from "./criadores.js";

const correio = new CorreioEmMemoria();
const pedido = {
  destino: "Posto da Ponte",
  mensagem: "Fechem a comporta antes da terceira badalada.",
};

// Ponto de composição: aqui se escolhem os criadores concretos.
for (const criador of [new CriadorDeCristal(correio), new CriadorDePergaminho(correio)]) {
  const recibo = avisarGuilda(criador, pedido);
  console.log(`#${recibo.id} | ${recibo.canal} | ${recibo.destino} | ${recibo.mensagem}`);
}
console.log(`Entregas registradas: ${correio.listarEntregas().length}`);
