import { Invocador } from "../src/invocador.js";
import { AvisosSimulados, ComandoAvisar } from "./avisos.js";

const porta = new AvisosSimulados();
const invocador = new Invocador();
invocador.executar(new ComandoAvisar(porta, "Reserva liberada para a ponte."));
porta.falharProximaCompensacao();
try { invocador.desfazerUltimo(); }
catch (erro: unknown) { console.log(erro instanceof Error ? erro.message : "Falha desconhecida."); }
console.log(`Após falha: registros ${porta.listar().length} | histórico ${invocador.listarHistorico().length}`);
invocador.desfazerUltimo();
for (const registro of porta.listar()) {
  console.log(`${registro.id}: ${registro.tipo} | referência ${registro.referencia ?? "nenhuma"} | ${registro.texto}`);
}
console.log(`Após compensação: registros ${porta.listar().length} | histórico ${invocador.listarHistorico().length}`);
