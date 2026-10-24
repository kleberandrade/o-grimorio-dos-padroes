import { Guerreiro, Mago, Arqueiro } from "./membros.js";
import { CalcularCapacidade, CalcularCusto, totalizar } from "./visitantes.js";
import { avaliarFicha } from "./union.js";

console.log(`Alternativa union: capacidade ${avaliarFicha({ tipo: "guerreiro", nome: "Ivo", forca: 6 }).capacidade}`);
const membros = [new Guerreiro("Ivo", 6), new Mago("Lume", 4), new Arqueiro("Cora", 5)];
const capacidade = new CalcularCapacidade(); const custo = new CalcularCusto();
for (const membro of membros) console.log(`${membro.nome}: capacidade ${membro.aceitar(capacidade)} | custo ${membro.aceitar(custo)}`);
console.log(`Total de capacidade: ${totalizar(membros, capacidade)}`);
console.log(`Total de abastecimento: ${totalizar(membros, custo)}`);
