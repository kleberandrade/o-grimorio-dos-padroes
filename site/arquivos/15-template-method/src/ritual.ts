import type { Encantamento, Etapa, ResultadoRitual } from "./contratos.js";
import { copiarEncantamento, mensagem, preparar, snapshot } from "./contratos.js";

export abstract class Ritual {
  // Template Method: a sequência está neste método da classe base.
  public realizar(ingredientes: readonly string[]): ResultadoRitual {
    const etapas: Etapa[] = [];
    let etapa: Etapa = "prepararIngredientes";
    let preparados: readonly string[] | null = null;
    let encantamento: Encantamento | null = null;
    let selo: string | null = null;
    try {
      preparados = Object.freeze([...this.prepararIngredientes(ingredientes)]);
      etapas.push(etapa);
      etapa = "conjurarEncantamento";
      encantamento = copiarEncantamento(this.conjurarEncantamento(preparados));
      etapas.push(etapa);
      etapa = "selar";
      selo = this.selar(encantamento);
      etapas.push(etapa);
      return Object.freeze({ status: "concluido", lote: snapshot(preparados, encantamento, selo),
        etapasConcluidas: Object.freeze([...etapas]) });
    } catch (erro: unknown) {
      return Object.freeze({ status: "falhou", lote: snapshot(preparados, encantamento, selo),
        etapasConcluidas: Object.freeze([...etapas]), etapaFalha: etapa, motivo: mensagem(erro) });
    }
  }

  protected prepararIngredientes(ingredientes: readonly string[]): readonly string[] {
    return preparar(ingredientes);
  }
  protected abstract conjurarEncantamento(ingredientes: readonly string[]): Encantamento;
  protected selar(encantamento: Encantamento): string { return `selo de ${encantamento.elemento}`; }
}

export class RitualFogo extends Ritual {
  protected override conjurarEncantamento(_ingredientes: readonly string[]): Encantamento {
    return { elemento: "fogo", efeito: "aquecimento modelado" };
  }
}

export class RitualGelo extends Ritual {
  protected override conjurarEncantamento(_ingredientes: readonly string[]): Encantamento {
    return { elemento: "gelo", efeito: "resfriamento modelado" };
  }
}
