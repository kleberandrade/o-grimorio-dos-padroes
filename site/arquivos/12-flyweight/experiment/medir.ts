import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Modelo, Parametros } from "./cenario.js";
import type { TipoEspirito } from "../src/espiritos.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contagem = Number(process.argv[2] ?? 100000);
const cardinalidade = Number(process.argv[3] ?? 3);
const repeticoes = Number(process.argv[4] ?? 5);
if (![1, 2, 3].includes(cardinalidade) || !Number.isSafeInteger(repeticoes) || repeticoes < 1 || repeticoes > 20) {
  throw new Error("Uso: npm run benchmark -- [contagem] [tipos:1|2|3] [repeticoes:1..20]");
}
const tipos: TipoEspirito[] = ["fogo", "gelo", "vento"];
const parametros: Parametros = { contagem, tipos: tipos.slice(0, cardinalidade) };
interface Observacao {
  modelo: Modelo;
  parametros: Parametros;
  node: string;
  v8: string;
  flags: string[];
  gcDisponivel: boolean;
  gcChamadas: number;
  tempoConstrucaoMs: number;
  memoriaBytes: { antes: NodeJS.MemoryUsage; depois: NodeJS.MemoryUsage; delta: NodeJS.MemoryUsage };
  conferencia: { contagem: number; essenciasUnicas: number; dadosSha256: string };
}
const observacoes: (Observacao & { repeticao: number; posicaoNaRepeticao: number })[] = [];
const worker = path.join(root, "dist/experiment/observacao.js");
for (let repeticao = 0; repeticao < repeticoes; repeticao++) {
  const ordem: Modelo[] = repeticao % 2 === 0 ? ["sem-compartilhar", "flyweight"] : ["flyweight", "sem-compartilhar"];
  for (const [posicaoNaRepeticao, modelo] of ordem.entries()) {
    const execucao = spawnSync(process.execPath, ["--expose-gc", worker, modelo, JSON.stringify(parametros)], { encoding: "utf8", cwd: root });
    if (execucao.error) throw execucao.error;
    if (execucao.status !== 0) throw new Error(execucao.stderr || `Processo encerrou com código ${execucao.status}.`);
    observacoes.push({ ...JSON.parse(execucao.stdout) as Observacao, repeticao: repeticao + 1, posicaoNaRepeticao: posicaoNaRepeticao + 1 });
  }
}
if (new Set(observacoes.map((item) => item.conferencia.dadosSha256)).size !== 1) throw new Error("Cenários semanticamente divergentes.");

function resumir(valores: number[]) {
  const ordem = [...valores].sort((a, b) => a - b);
  const central = Math.floor(ordem.length / 2);
  const valor = ordem[central];
  const anterior = ordem[central - 1];
  if (valor === undefined) throw new Error("Sem observações.");
  const mediana = ordem.length % 2 === 0 && anterior !== undefined ? (anterior + valor) / 2 : valor;
  return { minimo: ordem[0], mediana, maximo: ordem.at(-1) };
}
const metricas = ["rss", "heapTotal", "heapUsed", "external", "arrayBuffers"] as const;
const resumo = Object.fromEntries((["sem-compartilhar", "flyweight"] satisfies Modelo[]).map((modelo) => {
  const amostras = observacoes.filter((item) => item.modelo === modelo);
  return [modelo, { tempoConstrucaoMs: resumir(amostras.map((item) => item.tempoConstrucaoMs)),
    deltaMemoriaBytes: Object.fromEntries(metricas.map((metrica) => [metrica, resumir(amostras.map((item) => item.memoriaBytes.delta[metrica]))])) }];
}));
function fontes(dir = root): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    if (["node_modules", "dist", "evidence"].includes(item.name)) return [];
    const arquivo = path.join(dir, item.name);
    return item.isDirectory() ? fontes(arquivo) : [arquivo];
  }).sort();
}
const capturadoEm = new Date().toISOString();
const destino = path.join(root, "evidence/experimentos", `${capturadoEm.replace(/[:.]/g, "-")}-n${contagem}-k${cardinalidade}`);
mkdirSync(destino, { recursive: true });
const relatorio = {
  capturadoEm, comando: `npm run benchmark -- ${contagem} ${cardinalidade} ${repeticoes}`, parametros, repeticoes,
  ambiente: { node: process.versions.node, v8: process.versions.v8, npm: spawnSync("npm", ["--version"], { encoding: "utf8" }).stdout.trim(),
    typescript: JSON.parse(readFileSync(path.join(root, "node_modules/typescript/package.json"), "utf8")).version as string,
    tiposNode: JSON.parse(readFileSync(path.join(root, "node_modules/@types/node/package.json"), "utf8")).version as string,
    plataforma: process.platform, arquitetura: process.arch, releaseSO: os.release(), cpu: os.cpus()[0]?.model, processosFilhosSequenciais: true },
  metodo: {
    modelos: "Mesmas Aparicao/EssenciaEspirito, tipos/cores/posições; somente identidade intrínseca compartilhada difere. Strings podem ser internadas pelo runtime.",
    payload: "Somente tipo/cor reais do modelo; nenhum Buffer, ArrayBuffer ou payload sintético adicionado.",
    tempo: "performance.now em ms: construirCenario inclui validação de parâmetros, tabela quando usada, instâncias, posições e congelamento. Exclui aquecimento, startup, GC, leituras de memória, Set e hash de conferência.",
    memoria: "process.memoryUsage em bytes, baseline e depois com cenário retido explicitamente. GC exposto foi chamado uma vez antes e uma depois; isso não garante coleta completa ou valor exato.",
    categorias: "rss é processo inteiro; heapUsed/heapTotal V8; external inclui arrayBuffers. Não somar external e arrayBuffers como partes disjuntas.",
    controles: "Processo novo por observação; ordem dos modelos alterna entre repetições. Outras cargas do SO, JIT, alocador e GC não são totalmente controlados.",
    interpretacao: "Dados locais descritivos, sem limiar de ganho como teste, intervalo inferencial ou promessa universal. Deltas podem ser negativos ou inconclusivos; não comparar benchmark byte a byte em nova execução.",
  },
  fontesSha256: Object.fromEntries(fontes().map((file) => [path.relative(root, file), createHash("sha256").update(readFileSync(file)).digest("hex")])),
  resumo, observacoes,
};
const arquivo = path.join(destino, "resultados.json");
writeFileSync(arquivo, JSON.stringify(relatorio, null, 2) + "\n");
console.log(`Experimento registrado: ${path.relative(root, arquivo)}`);
console.log(JSON.stringify(resumo, null, 2));
