import type { Encantamento } from "../src/contratos.js";
import { RitualComHook } from "./ritual-com-hook.js";

export class RitualFogoInspecionado extends RitualComHook {
  readonly #aprovado: boolean;
  constructor(aprovado: boolean) { super(); this.#aprovado = aprovado; }
  protected override conjurarEncantamento(_ingredientes: readonly string[]): Encantamento {
    return { elemento: "fogo", efeito: "aquecimento modelado" };
  }
  protected override aposEncantamento(_encantamento: Encantamento): void {
    if (!this.#aprovado) throw new Error("Inspeção modelada recusou o lote.");
  }
}

// O hook padrão é opcional: esta variante não o sobrescreve.
export class RitualGeloComHookPadrao extends RitualComHook {
  protected override conjurarEncantamento(_ingredientes: readonly string[]): Encantamento {
    return { elemento: "gelo", efeito: "resfriamento modelado" };
  }
}
