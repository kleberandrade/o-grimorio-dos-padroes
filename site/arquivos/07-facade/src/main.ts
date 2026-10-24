import { FachadaPreparacao } from "./fachada.js";
import { criarSubsistemasEmMemoria } from "./subsistemas-em-memoria.js";

const pedido = { missao: "Recepção da aurora", refeicoes: 4, peca: "Fecho do corredor", rota: "Corredor de serviço" };
for (const [cenario, pecas] of [["Com peça", [pedido.peca]], ["Sem peça", []]] as const) {
  const subsistemas = criarSubsistemasEmMemoria(pecas);
  const resultado = new FachadaPreparacao(subsistemas).prepararMissao(pedido);
  console.log(`${cenario}: ${resultado.estado}`);
  console.log(resultado.etapas.map((etapa) => `${etapa.nome}=${etapa.estado}`).join(" | "));
  const estado = subsistemas.consultarEstado();
  const totalRefeicoes = estado.refeicoes.reduce((total, preparo) => total + preparo.quantidade, 0);
  console.log(`Efeitos: refeições ${totalRefeicoes} | reservas ${estado.reservas.length} | mapas ${estado.mapas.length} | passagens ${estado.passagens.length}`);
}
