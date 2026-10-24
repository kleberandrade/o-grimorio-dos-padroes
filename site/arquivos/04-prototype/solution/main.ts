import { SeloDeProcedencia } from "../src/selo.js";
import { PocaoComArmazenamento } from "./pocao-com-armazenamento.js";

const original = new PocaoComArmazenamento("L-01", [
  { nome: "Musgo de sal", dose: { quantidade: 2, unidade: "gramas" }, observacoes: [] },
], new SeloDeProcedencia("NARA-07", "Lumeria"), { limiteGraus: 20, etiquetas: ["Abrigo da luz"] });
const clone = original.clone("L-02");
clone.definirLimite(15);
clone.adicionarEtiqueta("Ensaio local");
console.log(`Armazenamento original: ${original.consultarArmazenamento().limiteGraus}`);
console.log(`Armazenamento clone: ${clone.consultarArmazenamento().limiteGraus}`);
console.log(`Etiquetas original: ${original.consultarArmazenamento().etiquetas.join("; ")}`);
console.log(`Selo compartilhado: ${original.selo === clone.selo}`);
