import type { EtapasDeExpedicao, FichaDePersonagem } from "../src/contratos.js";
import { DiretorDeResgate } from "../src/diretor.js";
import { criarFichaDireta } from "../src/direto.js";

export function prepararGaleriaComFiltro(builder: EtapasDeExpedicao, nome: string): void {
  new DiretorDeResgate().prepararGaleria(builder, nome);
  builder.adicionarEquipamento({ nome: "Máscara com filtro", protecoes: ["fumaca"] });
}

export function criarGaleriaComFiltroDireta(nome: string): FichaDePersonagem {
  return criarFichaDireta({
    nome, classe: "resgatista", vida: 100, missao: "galeria",
    equipamentos: [
      { nome: "Manto impermeável", protecoes: ["agua"] },
      { nome: "Lanterna", protecoes: [] },
      { nome: "Máscara com filtro", protecoes: ["fumaca"] },
    ],
  });
}
