import { DragaoAdapter } from "./adapter.js";
import { liberarRochaDoFarol } from "./cliente.js";
import { DragaoAntigo } from "./legado/dragao-antigo.js";
import { DragaoNativo } from "./nativo.js";

for (const [nome, dragao] of [
  ["Nativo", new DragaoNativo()],
  ["Adaptado", new DragaoAdapter(new DragaoAntigo())],
] as const) {
  const ensaio = liberarRochaDoFarol(dragao, "Trava do farol");
  console.log(`${nome}: ${ensaio.velocidadeMps.toFixed(3)} m/s | ${ensaio.resultado.alvo} | liberada ${ensaio.resultado.rochaLiberada}`);
}

try {
  new DragaoAdapter(new DragaoAntigo()).atacar({ alvo: "Trava do farol", efeito: "gelo" });
} catch (erro: unknown) {
  if (!(erro instanceof Error)) throw erro;
  console.log(`Ordem recusada: ${erro.message}`);
}
