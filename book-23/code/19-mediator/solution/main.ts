import { planejarCotas } from "./cotas.js";
import { montarConselho } from "../src/montagem.js";

const plano = planejarCotas(10, [{ grupo: "barqueiros", quantidade: 8 }, { grupo: "cultivadores", quantidade: 6 }]);
for (const cota of plano.cotas) console.log(`${cota.grupo}: pediu ${cota.solicitado} | cota ${cota.concedido}`);
console.log(`Restante: ${plano.restante}`);
const posto = montarConselho();
console.log(`Planejar cotas não abriu: ${posto.guarda.snapshot().aberta}`);
posto.barqueiros.pedirAbertura();
posto.cultivadores.confirmarInspecao(true);
posto.barqueiros.confirmarAmarras(true);
console.log(`Abertura pelo protocolo: ${posto.guarda.confirmarAutorizacao(true).estado}`);
