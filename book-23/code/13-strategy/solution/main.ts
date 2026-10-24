import { AtaqueMagia } from "../src/estrategias.js";
import { ataqueArcoFuncao, criarContextoFuncional } from "./funcional.js";

const alvo = { nome: "Corda do portão", distanciaMetros: 12, resistencia: "comum" } as const;
const direta = ataqueArcoFuncao(alvo);
console.log(`Função direta: ${direta.tecnica} | ${direta.estado} | custo ${direta.custo}`);
const contexto = criarContextoFuncional("Rima", ataqueArcoFuncao);
const magia = new AtaqueMagia();
contexto.trocarEstrategia((pedido) => magia.atacar(pedido));
const trocada = contexto.atacar({ nome: "Selo reforçado", distanciaMetros: 6, resistencia: "reforcada" });
console.log(`Contexto funcional: ${contexto.nome} | ${trocada.tecnica} | ${trocada.estado} | custo ${trocada.custo}`);
