import { Repeticao } from "./repeticao.js";
import type { Expressao } from "../src/expressoes.js";
import { RunaFogo, RunaGelo, RunaLuz, Sequencia } from "../src/expressoes.js";
import { ErroPrograma, MAX_GRUPOS, validarTexto } from "../src/limites.js";

class Parser {
  readonly #texto: string;
  #indice = 0;
  constructor(texto: string) { this.#texto = texto; }
  analisar(): Expressao { return this.#sequencia(0, null); }
  #espacos(): void { while (" \t\r\n".includes(this.#texto[this.#indice] ?? "\0")) this.#indice += 1; }
  #sequencia(profundidade: number, abertura: number | null): Expressao {
    const partes: Expressao[] = [];
    while (true) {
      this.#espacos();
      if (this.#indice === this.#texto.length) {
        if (abertura !== null) throw new ErroPrograma("ABERTURA", this.#indice, `Grupo aberto na posição ${abertura} sem fechamento`);
        break;
      }
      if (this.#texto[this.#indice] === ")") {
        if (abertura === null) throw new ErroPrograma("FECHAMENTO", this.#indice, "Fechamento sem abertura");
        break;
      }
      partes.push(this.#termo(profundidade));
    }
    if (partes.length === 0) throw new ErroPrograma("VAZIO", this.#indice, "Sequência vazia não permitida");
    return new Sequencia(partes);
  }
  #termo(profundidade: number): Expressao {
    const simbolo = this.#texto[this.#indice];
    let expressao: Expressao;
    switch (simbolo) {
      case "F": this.#indice += 1; expressao = new RunaFogo(); break;
      case "I": this.#indice += 1; expressao = new RunaGelo(); break;
      case "L": this.#indice += 1; expressao = new RunaLuz(); break;
      case "(": {
        const abertura = this.#indice;
        if (profundidade >= MAX_GRUPOS) throw new ErroPrograma("PROFUNDIDADE", abertura, "Mais de oito grupos aninhados");
        this.#indice += 1;
        expressao = this.#sequencia(profundidade + 1, abertura);
        this.#indice += 1; // A sequência interna só retorna ao encontrar seu fechamento.
        break;
      }
      default: throw new ErroPrograma("SIMBOLO", this.#indice, "Símbolo não reconhecido");
    }
    this.#espacos();
    if (this.#texto[this.#indice] === "*") {
      this.#indice += 1;
      this.#espacos();
      const posicao = this.#indice;
      const digito = this.#texto[this.#indice];
      if (digito === undefined || !"123456789".includes(digito)) {
        throw new ErroPrograma("REPETICAO", posicao, "Contagem deve ser um dígito de 1 a 9");
      }
      this.#indice += 1;
      const seguinte = this.#texto[this.#indice];
      if (seguinte !== undefined && "0123456789".includes(seguinte)) {
        throw new ErroPrograma("REPETICAO", this.#indice, "Contagem multidígito não permitida");
      }
      expressao = new Repeticao(expressao, Number(digito));
    }
    return expressao;
  }
}
export function analisarRepeticoes(texto: string): Expressao {
  validarTexto(texto);
  return new Parser(texto).analisar();
}
