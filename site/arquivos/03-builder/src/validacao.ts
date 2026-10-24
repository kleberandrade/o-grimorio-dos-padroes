import type { Equipamento, FichaDePersonagem, Missao } from "./contratos.js";

interface EntradaDeFicha {
  readonly nome?: string;
  readonly classe?: string;
  readonly vida?: number;
  readonly missao?: Missao;
  readonly equipamentos: readonly Equipamento[];
}

export function validarECopiarFicha(dados: EntradaDeFicha): FichaDePersonagem {
  const nome = dados.nome?.trim();
  const classe = dados.classe?.trim();
  if (!nome) throw new Error("Nome obrigatório.");
  if (!classe) throw new Error("Classe obrigatória.");
  const vida = dados.vida;
  if (vida === undefined || !Number.isFinite(vida) || vida <= 0) {
    throw new Error("Vida deve ser positiva e finita.");
  }
  const missao = dados.missao;
  if (missao === undefined) throw new Error("Missão obrigatória.");
  const protecaoExigida = missao === "torre" ? "vento" : "agua";
  if (!dados.equipamentos.some((item) => item.protecoes.includes(protecaoExigida))) {
    throw new Error(`Proteção obrigatória para ${missao}: ${protecaoExigida}.`);
  }
  const equipamentos = dados.equipamentos.map((item) => {
    const nomeDoItem = item.nome.trim();
    if (!nomeDoItem) throw new Error("Nome do equipamento obrigatório.");
    return Object.freeze({ nome: nomeDoItem, protecoes: Object.freeze([...item.protecoes]) });
  });
  return Object.freeze({ nome, classe, vida, missao, equipamentos: Object.freeze(equipamentos) });
}
