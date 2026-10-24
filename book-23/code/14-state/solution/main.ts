import { Guerreiro } from "../src/guerreiro.js";
import { EstadoDefensivo } from "./defensivo.js";

const guerreiro = new Guerreiro("Dário", new EstadoDefensivo());
const descanso = guerreiro.descansar({ protegido: false });
console.log(`Defensivo sem proteção: ${descanso.executada ? "executada" : "recusada"} | ${descanso.depois}`);
const ataque = guerreiro.atacar();
console.log(`Contra-ataque: ${ataque.executada ? "executada" : "recusada"} | ${ataque.antes} -> ${ataque.depois}`);
console.log(`Ciclo normal retomado: ${guerreiro.atacar().depois} | fúria restante ${guerreiro.situacao().intervalosFuria}`);
