import { Worker } from "node:worker_threads";

export interface ResultadoDaSonda {
  antes: number;
  depois: number;
  mesmaIdentidade: boolean;
}

export function observarOutroContexto(): Promise<ResultadoDaSonda> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./sonda-worker.js", import.meta.url));
    let resultado: ResultadoDaSonda | undefined;
    worker.on("message", (dados: unknown) => {
      if (typeof dados !== "object" || dados === null
        || !("antes" in dados) || typeof dados.antes !== "number"
        || !("depois" in dados) || typeof dados.depois !== "number"
        || !("mesmaIdentidade" in dados) || typeof dados.mesmaIdentidade !== "boolean") {
        reject(new Error("Resposta da sonda inválida."));
        return;
      }
      resultado = { antes: dados.antes, depois: dados.depois, mesmaIdentidade: dados.mesmaIdentidade };
    });
    worker.once("error", reject);
    worker.once("exit", (codigo) => {
      if (codigo !== 0) reject(new Error(`Worker encerrou com código ${codigo}.`));
      else if (!resultado) reject(new Error("Worker encerrou sem resultado."));
      else resolve(resultado);
    });
  });
}
