import { RitualFogoInspecionado } from "./inspecao.js";
for (const aprovado of [false, true]) {
  const resultado = new RitualFogoInspecionado(aprovado).realizar(["água", "sal arcano"]);
  console.log(`Inspeção ${aprovado ? "aprovada" : "recusada"}: ${resultado.status} | selo: ${resultado.lote.selo}`);
  console.log(`Etapas concluídas: ${resultado.etapasConcluidas.join(" -> ")}`);
  if (resultado.status === "falhou") console.log(`Interrompido em: ${resultado.etapaFalha}`);
}
