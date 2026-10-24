import { createHash } from "node:crypto";
import { Aparicao, EssenciaEspirito, GuildaDosEspiritos, validarTipo } from "../src/espiritos.js";
import type { TipoEspirito } from "../src/espiritos.js";

export type Modelo = "sem-compartilhar" | "flyweight";
export interface Parametros { readonly contagem: number; readonly tipos: readonly TipoEspirito[]; }

export function construirCenario(modelo: Modelo, parametros: Parametros) {
  if (!Number.isSafeInteger(parametros.contagem) || parametros.contagem < 1 || parametros.contagem > 1_000_000) {
    throw new Error("Contagem deve ser inteiro entre 1 e 1000000 neste experimento.");
  }
  if (parametros.tipos.length === 0) throw new Error("Informe ao menos um tipo.");
  for (const tipo of parametros.tipos) validarTipo(tipo);
  const guilda = modelo === "flyweight" ? new GuildaDosEspiritos() : undefined;
  const aparicoes: Aparicao[] = [];
  for (let i = 0; i < parametros.contagem; i++) {
    const tipo = parametros.tipos[i % parametros.tipos.length];
    if (tipo === undefined) throw new Error("Tipo ausente do cenário.");
    const essencia = guilda ? guilda.obter(tipo) : new EssenciaEspirito(tipo);
    aparicoes.push(new Aparicao(essencia, { x: i % 1000, y: Math.floor(i / 1000) }));
  }
  return { aparicoes, guilda };
}

export function conferirCenario(cenario: ReturnType<typeof construirCenario>) {
  const hash = createHash("sha256");
  const identidades = new Set<EssenciaEspirito>();
  for (const aparicao of cenario.aparicoes) {
    const dados = aparicao.descrever();
    hash.update(`${dados.tipo}|${dados.cor}|${dados.x}|${dados.y}\n`);
    identidades.add(aparicao.essencia);
  }
  return { contagem: cenario.aparicoes.length, essenciasUnicas: identidades.size, dadosSha256: hash.digest("hex") };
}
