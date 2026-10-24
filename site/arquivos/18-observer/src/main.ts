import { Oraculo } from "./oraculo.js";
import type { Desligar } from "./oraculo.js";

// Alternativa simples: chamada direta para uma reação estável.
const avisosDiretos: string[] = [];
const anotarDiretamente = (mensagem: string) => { avisosDiretos.push(mensagem); };
anotarDiretamente("Recolher bancas.");
console.log(`Chamada direta: ${avisosDiretos[0]}`);

const oraculo = new Oraculo();
let chamadosNaCasa = 0;
let abrigoAberto = false;
const publicacoes: string[] = [];
let desligarAposentado: Desligar = () => false;
desligarAposentado = oraculo.inscrever("Aposentado", () => {
  chamadosNaCasa += 1;
  desligarAposentado();
});
oraculo.inscrever("Sino", () => { throw new Error("Cabo do sino rompido."); });
oraculo.inscrever("Escriba", (aviso) => { publicacoes.push(aviso.mensagem); });
oraculo.inscrever("Salão", () => { abrigoAberto = true; });
console.log("Avisos de Nilo");
for (const mensagem of ["Rajada prevista: recolher bancas.", "Rajada próxima: manter passagem livre."]) {
  const relatorio = oraculo.emitir({ mensagem, local: "Praça de Valharth" });
  console.log(`Aviso: ${relatorio.aviso.mensagem}`);
  for (const reacao of relatorio.reacoes) {
    console.log(`${reacao.nome}: ${reacao.status}${reacao.status === "falhou" ? ` | ${reacao.motivo}` : ""}`);
  }
}
console.log(`Casa aposentada: ${chamadosNaCasa} chamado | publicações: ${publicacoes.length} | abrigo aberto: ${abrigoAberto}`);
console.log(`Inscrições restantes: ${oraculo.numeroInscricoes()}`);
