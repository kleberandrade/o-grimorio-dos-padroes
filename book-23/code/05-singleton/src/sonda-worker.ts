import { parentPort } from "node:worker_threads";
import { obterRegistroCompartilhado } from "./modulo-compartilhado.js";

if (!parentPort) throw new Error("Sonda deve executar num Worker.");
const registro = obterRegistroCompartilhado();
const antes = registro.listarOrdens().length;
registro.registrar({ equipe: "Margem distante", comporta: "Leste", acao: "fechar", turno: "dia" });
parentPort.postMessage({
  antes,
  depois: registro.listarOrdens().length,
  mesmaIdentidade: registro === obterRegistroCompartilhado(),
});
