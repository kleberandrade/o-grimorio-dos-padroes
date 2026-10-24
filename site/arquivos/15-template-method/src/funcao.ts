import type { Encantamento, Etapa, ResultadoRitual } from "./contratos.js";
import { copiarEncantamento, mensagem, preparar, snapshot } from "./contratos.js";

// Alternativa anterior à hierarquia: uma função de sequência com callback.
export function realizarComCallback(ingredientes: readonly string[],
  conjurar: (preparados: readonly string[]) => Encantamento): ResultadoRitual {
  const etapas: Etapa[] = [];
  let etapa: Etapa = "prepararIngredientes";
  let preparados: readonly string[] | null = null;
  let encantamento: Encantamento | null = null;
  let selo: string | null = null;
  try {
    preparados = preparar(ingredientes);
    etapas.push(etapa);
    etapa = "conjurarEncantamento";
    encantamento = copiarEncantamento(conjurar(preparados));
    etapas.push(etapa);
    etapa = "selar";
    selo = `selo de ${encantamento.elemento}`;
    etapas.push(etapa);
    return Object.freeze({ status: "concluido", lote: snapshot(preparados, encantamento, selo),
      etapasConcluidas: Object.freeze([...etapas]) });
  } catch (erro: unknown) {
    return Object.freeze({ status: "falhou", lote: snapshot(preparados, encantamento, selo),
      etapasConcluidas: Object.freeze([...etapas]), etapaFalha: etapa, motivo: mensagem(erro) });
  }
}
