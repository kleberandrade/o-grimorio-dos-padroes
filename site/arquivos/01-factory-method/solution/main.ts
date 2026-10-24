import { avisarGuilda } from "../src/cliente.js";
import { CorreioEmMemoria } from "../src/correio-em-memoria.js";
import { CriadorDeCorvo } from "./corvo.js";

const correio = new CorreioEmMemoria();
const recibo = avisarGuilda(new CriadorDeCorvo(correio), {
  destino: "Posto da Ponte",
  mensagem: "Fechem a comporta antes da terceira badalada.",
});
console.log(`#${recibo.id} | ${recibo.canal} | ${recibo.destino} | ${recibo.mensagem}`);
