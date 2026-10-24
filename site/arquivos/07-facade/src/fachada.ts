import type { EtapaPreparacao, Mapa, PedidoPreparacao, ResultadoPreparacao, Subsistemas } from "./contratos.js";

export class FachadaPreparacao {
  constructor(private readonly subsistemas: Subsistemas) {}

  prepararMissao(pedido: PedidoPreparacao): ResultadoPreparacao {
    const missao = pedido.missao.trim();
    const peca = pedido.peca.trim();
    const rota = pedido.rota.trim();
    if (!missao || !peca || !rota) throw new Error("Missão, peça e rota são obrigatórias.");
    if (!Number.isSafeInteger(pedido.refeicoes) || pedido.refeicoes < 0) {
      throw new Error("Refeições devem ser um inteiro não negativo seguro.");
    }
    const etapas: EtapaPreparacao[] = [];
    const falhou = (nome: EtapaPreparacao["nome"], erro: unknown): void => {
      etapas.push({ nome, estado: "falhou", detalhe: erro instanceof Error ? erro.message : String(erro) });
    };

    if (pedido.refeicoes === 0) {
      etapas.push({ nome: "cozinha", estado: "ignorada", detalhe: "Nenhuma refeição solicitada." });
    } else {
      try {
        this.subsistemas.cozinha.prepararRefeicoes(missao, pedido.refeicoes);
        etapas.push({ nome: "cozinha", estado: "concluida", detalhe: `${pedido.refeicoes} refeições preparadas.` });
      } catch (erro: unknown) { falhou("cozinha", erro); }
    }

    let pecaReservada = false;
    try {
      pecaReservada = this.subsistemas.arsenal.reservarPeca(missao, peca);
      etapas.push({ nome: "arsenal", estado: pecaReservada ? "concluida" : "pendente", detalhe: pecaReservada ? `Peça reservada: ${peca}.` : `Peça indisponível: ${peca}.` });
    } catch (erro: unknown) { falhou("arsenal", erro); }

    let mapa: Mapa | undefined;
    try {
      mapa = this.subsistemas.arquivo.buscarMapa(rota);
      etapas.push({ nome: "arquivo", estado: "concluida", detalhe: `Mapa obtido: ${mapa.referencia}.` });
    } catch (erro: unknown) { falhou("arquivo", erro); }

    if (!pecaReservada || !mapa) {
      etapas.push({ nome: "guarda", estado: "pendente", detalhe: "Aguarda peça reservada e mapa da rota." });
    } else {
      try {
        this.subsistemas.guarda.prepararPassagem(missao, rota, mapa);
        etapas.push({ nome: "guarda", estado: "concluida", detalhe: `Passagem preparada: ${rota}.` });
      } catch (erro: unknown) { falhou("guarda", erro); }
    }

    const pronta = etapas.every((etapa) => etapa.estado === "concluida" || etapa.estado === "ignorada");
    return Object.freeze({ estado: pronta ? "pronta" : "parcial", etapas: Object.freeze(etapas.map((etapa) => Object.freeze(etapa))) });
  }
}
