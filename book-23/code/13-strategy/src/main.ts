import { Combatente } from "./combatente.js";
import type { ResultadoAtaque } from "./contratos.js";
import { AtaqueArco, AtaqueEspada, AtaqueMagia } from "./estrategias.js";

function imprimir(resultado: ResultadoAtaque): void {
  console.log(`${resultado.tecnica} em ${resultado.alvo}: ${resultado.estado} | custo ${resultado.custo} | ${resultado.estado === "executado" ? resultado.efeito : resultado.motivo}`);
}
const rima = new Combatente("Rima", new AtaqueEspada());
const mesmoContexto = rima;
const corda = { nome: "Corda do portão", distanciaMetros: 12, resistencia: "comum" } as const;
imprimir(rima.atacar(corda));
rima.trocarEstrategia(new AtaqueArco());
imprimir(rima.atacar(corda));
rima.trocarEstrategia(new AtaqueMagia());
imprimir(rima.atacar({ nome: "Selo reforçado", distanciaMetros: 6, resistencia: "reforcada" }));
rima.trocarEstrategia(new AtaqueEspada());
imprimir(rima.atacar({ nome: "Trava próxima", distanciaMetros: 1, resistencia: "comum" }));
console.log(`Contexto preservado: ${rima === mesmoContexto} | ${rima.nome}`);
