import { Oraculo } from "../src/oraculo.js";
import { EscopoDeInscricoes } from "./escopo.js";

const oraculo = new Oraculo();
const turno = new EscopoDeInscricoes();
const recebidos: string[] = [];
let removidos = 0;
turno.inscrever(oraculo, "Fim do turno", () => { removidos = turno.encerrar(); });
turno.inscrever(oraculo, "Escriba do turno", (aviso) => { recebidos.push(aviso.mensagem); });
const primeiro = oraculo.emitir({ mensagem: "Troca de turno.", local: "Torre" });
console.log(`Rodada atual: ${primeiro.reacoes.map((item) => item.nome).join(", ")}`);
console.log(`Vínculos removidos: ${removidos} | avisos escritos: ${recebidos.length}`);
console.log(`Próxima rodada: ${oraculo.emitir({ mensagem: "Novo turno.", local: "Torre" }).reacoes.length} reações`);
console.log(`Encerrar novamente: ${turno.encerrar()}`);
try { turno.inscrever(oraculo, "Fora do turno", () => {}); }
catch (erro: unknown) { console.log(erro instanceof Error ? erro.message : "Falha desconhecida."); }
