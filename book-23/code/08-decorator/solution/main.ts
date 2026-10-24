import { Espada } from "../src/espada.js";
import { MantoDeCalor } from "../src/mantos.js";
import { MantoLimitador } from "./limitador.js";

const espada = new Espada(10);
const somaAntesDeLimitar = new MantoLimitador(new MantoDeCalor(espada, 3), 11).executar();
const limitaAntesDeSomar = new MantoDeCalor(new MantoLimitador(espada, 11), 3).executar();
console.log(`Calor -> limite: ${somaAntesDeLimitar.potencia} | ${somaAntesDeLimitar.efeitos.join(" -> ")}`);
console.log(`Limite -> calor: ${limitaAntesDeSomar.potencia} | ${limitaAntesDeSomar.efeitos.join(" -> ")}`);
