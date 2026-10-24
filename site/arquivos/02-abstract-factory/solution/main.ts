import { ensaiarKit } from "../src/cliente.js";
import { FabricaDeVento } from "./vento.js";

const resultado = ensaiarKit(new FabricaDeVento(), 3);
console.log(`${resultado.afinidade} | ${resultado.arma} + ${resultado.protecao} | intensidade ${resultado.intensidade} | compatível`);
