export const MAX_TEXTO = 256;
export const MAX_GRUPOS = 8;
export const MAX_OPERACOES = 64;
export type CodigoErro = "TAMANHO" | "SIMBOLO" | "FECHAMENTO" | "ABERTURA" | "VAZIO" | "PROFUNDIDADE" | "REPETICAO" | "ORCAMENTO";
export class ErroPrograma extends Error {
  readonly codigo: CodigoErro;
  readonly posicao: number;
  readonly causa: string;
  constructor(codigo: CodigoErro, posicao: number, causa: string) {
    super(`${causa} (posição ${posicao}).`);
    this.name = "ErroPrograma"; this.codigo = codigo; this.posicao = posicao; this.causa = causa;
  }
}
export function validarTexto(texto: string): void {
  if (typeof texto !== "string") throw new Error("Programa deve ser string.");
  if (texto.length > MAX_TEXTO) throw new ErroPrograma("TAMANHO", MAX_TEXTO, "Texto excede 256 unidades UTF16");
}
