import { RitualFogo, RitualGelo } from "./ritual.js";

console.log("Lotes de Ema");
for (const ritual of [new RitualFogo(), new RitualGelo()]) {
  const resultado = ritual.realizar(["água", "sal arcano"]);
  console.log(`${resultado.status}: ${resultado.etapasConcluidas.join(" -> ")}`);
  console.log(`Encantamento: ${resultado.lote.encantamento?.elemento} | selo: ${resultado.lote.selo}`);
}
const falha = new RitualFogo().realizar([]);
if (falha.status === "falhou") {
  console.log(`Falha em ${falha.etapaFalha}: ${falha.motivo} | selo: ${falha.lote.selo}`);
}
