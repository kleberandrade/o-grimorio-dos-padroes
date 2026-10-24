import { FachadaPreparacao } from "../src/fachada.js";
import { criarSubsistemasEmMemoria } from "../src/subsistemas-em-memoria.js";
import { coordenarVisita } from "./coordenacao.js";

const fachada = new FachadaPreparacao(criarSubsistemasEmMemoria([]));
const pedido = { missao: "Recepção da aurora", refeicoes: 4, peca: "Fecho do corredor", rota: "Corredor de serviço" };
const negada = coordenarVisita(fachada, { consultarAutorizacao: () => ({ permitida: false, motivo: "Acordo não confirmado." }) }, pedido);
const autorizada = coordenarVisita(fachada, { consultarAutorizacao: () => ({ permitida: true, motivo: "Decisão externa registrada." }) }, pedido);
console.log(`Visita sem autorização: ${negada.estado}`);
if (autorizada.estado === "autorizada") console.log(`Visita autorizada: preparação ${autorizada.preparacao.estado}`);
