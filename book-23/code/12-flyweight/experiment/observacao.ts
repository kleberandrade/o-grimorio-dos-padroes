import { performance } from "node:perf_hooks";
import { construirCenario, conferirCenario } from "./cenario.js";
import type { Modelo, Parametros } from "./cenario.js";

if (process.versions.node !== "26.10.0") throw new Error("Experimento fixado em Node 26.10.0.");
const modelo = process.argv[2];
if (modelo !== "sem-compartilhar" && modelo !== "flyweight") throw new Error("Modelo desconhecido.");
const parametros = JSON.parse(process.argv[3] ?? "null") as Parametros;
if (typeof global.gc !== "function") throw new Error("Flag --expose-gc não disponibilizou global.gc neste runtime.");

// Aquecimento igual em cada processo, fora do intervalo medido e sem reter seus dados.
for (const modo of ["sem-compartilhar", "flyweight"] satisfies Modelo[]) {
  construirCenario(modo, { contagem: 1000, tipos: parametros.tipos });
}
global.gc();
const antes = process.memoryUsage();
const inicio = performance.now();
const cenario = construirCenario(modelo, parametros);
const tempoConstrucaoMs = performance.now() - inicio;

// Referência global explícita mantém todos os dados e a tabela vivos durante a medição.
Object.defineProperty(globalThis, "cenarioRetidoDoExperimento", { value: cenario });
global.gc();
const depois = process.memoryUsage();
const delta = {
  rss: depois.rss - antes.rss,
  heapTotal: depois.heapTotal - antes.heapTotal,
  heapUsed: depois.heapUsed - antes.heapUsed,
  external: depois.external - antes.external,
  arrayBuffers: depois.arrayBuffers - antes.arrayBuffers,
};

// Conferência e Set de identidades acontecem DEPOIS das leituras e fora do tempo.
const conferencia = conferirCenario(cenario);
process.stdout.write(JSON.stringify({ modelo, parametros, node: process.versions.node, v8: process.versions.v8,
  flags: process.execArgv, gcDisponivel: true, gcChamadas: 2,
  tempoConstrucaoMs, memoriaBytes: { antes, depois, delta }, conferencia }) + "\n");
