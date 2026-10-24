import type { Encantamento, Etapa, Lote } from "../src/contratos.js";
import { copiarEncantamento, mensagem, preparar, snapshot } from "../src/contratos.js";

export type EtapaComHook = Etapa | "aposEncantamento";
export type ResultadoComHook = Readonly<{ status: "concluido"; lote: Lote; etapasConcluidas: readonly EtapaComHook[] }>
  | Readonly<{ status: "falhou"; lote: Lote; etapasConcluidas: readonly EtapaComHook[]; etapaFalha: EtapaComHook; motivo: string }>;

export abstract class RitualComHook {
  // Versão da base alterada explicitamente para o exercício.
  // Template Method: a sequência está neste método da classe base.
  public realizar(ingredientes: readonly string[]): ResultadoComHook {
    const etapas: EtapaComHook[] = [];
    let etapa: EtapaComHook = "prepararIngredientes";
    let preparados: readonly string[] | null = null;
    let encantamento: Encantamento | null = null;
    let selo: string | null = null;
    try {
      preparados = Object.freeze([...this.prepararIngredientes(ingredientes)]);
      etapas.push(etapa);
      etapa = "conjurarEncantamento";
      encantamento = copiarEncantamento(this.conjurarEncantamento(preparados));
      etapas.push(etapa);
      etapa = "aposEncantamento";
      this.aposEncantamento(encantamento);
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

  protected aposEncantamento(_encantamento: Encantamento): void {}

  protected prepararIngredientes(ingredientes: readonly string[]): readonly string[] {
    return preparar(ingredientes);
  }
  protected abstract conjurarEncantamento(ingredientes: readonly string[]): Encantamento;
  protected selar(encantamento: Encantamento): string { return `selo de ${encantamento.elemento}`; }
}

