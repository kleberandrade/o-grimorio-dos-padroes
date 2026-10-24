import { personalizarLote } from "./cliente.js";
import { Pocao } from "./pocao.js";
import { SeloDeProcedencia } from "./selo.js";

const selo = new SeloDeProcedencia("NARA-07", "Lumeria");
const original = new Pocao("L-01", [
  { nome: "Musgo de sal", dose: { quantidade: 2, unidade: "gramas" }, observacoes: ["Fórmula preservada"] },
  { nome: "Extrato de junco", dose: { quantidade: 4, unidade: "gotas" }, observacoes: [] },
], selo);
const variante = personalizarLote(original, "L-02", "Musgo de sal", 3);
variante.anotarIngrediente("Musgo de sal", "Variante para solo alagado");

console.log(`Original: ${original.descrever()}`);
console.log(`Clone personalizado: ${variante.descrever()}`);
console.log(`Selo compartilhado: ${original.selo === variante.selo}`);
console.log(`Notas do original: ${original.consultarIngredientes()[0]?.observacoes.join("; ")}`);
