import type { Subsistemas } from "./contratos.js";

export function criarSubsistemasEmMemoria(pecasDisponiveis: readonly string[] = ["Fecho do corredor"]) {
  const estoque = [...pecasDisponiveis];
  const chamadas: string[] = [];
  const refeicoes: { missao: string; quantidade: number }[] = [];
  const reservas: { missao: string; peca: string }[] = [];
  const mapas: string[] = [];
  const passagens: { missao: string; rota: string; mapa: string }[] = [];

  const subsistemas: Subsistemas = {
    cozinha: {
      prepararRefeicoes: (missao, quantidade) => {
        chamadas.push("cozinha");
        refeicoes.push({ missao, quantidade });
      },
    },
    arsenal: {
      reservarPeca: (missao, peca) => {
        chamadas.push("arsenal");
        const posicao = estoque.indexOf(peca);
        if (posicao < 0) return false;
        estoque.splice(posicao, 1);
        reservas.push({ missao, peca });
        return true;
      },
    },
    arquivo: {
      buscarMapa: (rota) => {
        chamadas.push("arquivo");
        mapas.push(rota);
        return Object.freeze({ rota, referencia: `mapa:${rota}` });
      },
    },
    guarda: {
      prepararPassagem: (missao, rota, mapa) => {
        chamadas.push("guarda");
        if (mapa.rota !== rota) throw new Error("Mapa não corresponde à rota.");
        passagens.push({ missao, rota, mapa: mapa.referencia });
      },
    },
  };

  return {
    ...subsistemas,
    consultarEstado: () => ({
      estoque: [...estoque],
      chamadas: [...chamadas],
      refeicoes: refeicoes.map((item) => ({ ...item })),
      reservas: reservas.map((item) => ({ ...item })),
      mapas: [...mapas],
      passagens: passagens.map((item) => ({ ...item })),
    }),
  };
}
