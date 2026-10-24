import { RegistroEmMemoria } from "../src/registro.js";
import { iniciarCasa } from "./raiz.js";

const primeira = iniciarCasa();
const segunda = iniciarCasa();
console.log(`Raízes com ciclo padrão compartilham registro: ${primeira.registro === segunda.registro}`);
const isolada = iniciarCasa(new RegistroEmMemoria());
isolada.equipeSul.emitirOrdem("Leste", "fechar");
console.log(`Casa isolada: ${isolada.registro.listarOrdens().length} ordem`);
console.log(`Registro padrão: ${primeira.registro.listarOrdens().length} ordens`);
