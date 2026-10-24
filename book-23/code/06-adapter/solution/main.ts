import { liberarRochaDoFarol } from "../src/cliente.js";
import { DragaoMaritimoAdapter } from "./adapter-maritimo.js";
import { DragaoMaritimo } from "./fornecedor-maritimo.js";

const ensaio = liberarRochaDoFarol(new DragaoMaritimoAdapter(new DragaoMaritimo()), "Trava do farol");
console.log(`Marítimo: ${ensaio.velocidadeMps.toFixed(3)} m/s | ${ensaio.resultado.alvo} | liberada ${ensaio.resultado.rochaLiberada}`);
