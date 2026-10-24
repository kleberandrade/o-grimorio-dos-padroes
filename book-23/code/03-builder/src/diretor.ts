import type { EtapasDeExpedicao } from "./contratos.js";

// Director opcional: reutiliza receitas com qualquer representação das etapas.
export class DiretorDeResgate {
  prepararTorre(builder: EtapasDeExpedicao, nome: string): void {
    builder.reiniciar();
    builder.definirIdentidade(nome, "resgatista");
    builder.definirVida(100);
    builder.definirMissao("torre");
    builder.adicionarEquipamento({ nome: "Capa contra vento", protecoes: ["vento"] });
    builder.adicionarEquipamento({ nome: "Corda", protecoes: [] });
  }

  prepararGaleria(builder: EtapasDeExpedicao, nome: string): void {
    builder.reiniciar();
    builder.definirIdentidade(nome, "resgatista");
    builder.definirVida(100);
    builder.definirMissao("galeria");
    builder.adicionarEquipamento({ nome: "Manto impermeável", protecoes: ["agua"] });
    builder.adicionarEquipamento({ nome: "Lanterna", protecoes: [] });
  }
}
