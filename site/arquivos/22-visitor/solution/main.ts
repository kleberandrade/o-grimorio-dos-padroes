import { Guerreiro, Mago, Arqueiro, Curandeiro } from "./membros-ampliados.js";
import { CalcularCapacidade, CalcularCusto, totalizar } from "./visitantes-ampliados.js";

const membros = [new Guerreiro("Ivo", 6), new Mago("Lume", 4), new Arqueiro("Cora", 5), new Curandeiro("Neve", 3)];
const capacidade = new CalcularCapacidade(); const custo = new CalcularCusto();
for (const membro of membros) console.log(`${membro.nome}: capacidade ${membro.aceitar(capacidade)} | custo ${membro.aceitar(custo)}`);
console.log(`Quatro tipos: capacidade ${totalizar(membros, capacidade)} | abastecimento ${totalizar(membros, custo)}`);
