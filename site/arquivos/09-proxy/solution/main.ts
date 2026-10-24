import { SalaReal } from "../src/sala-real.js";
import { ProxyVirtual } from "./proxy-virtual.js";

let criacoes = 0;
const virtual = new ProxyVirtual(() => { criacoes++; return new SalaReal(); });
console.log(`Criações antes da operação: ${criacoes}`);
virtual.entrar({ nome: "Mecânico", mandatoValido: false });
console.log(`Criações após primeira operação: ${criacoes}`);
const segunda = virtual.entrar({ nome: "Operadora", mandatoValido: true });
console.log(`Criações após segunda operação: ${criacoes}`);
console.log(`Segunda entrada: ${segunda.estado}${segunda.estado === "permitida" ? ` | registro ${segunda.registro}` : ""}`);
