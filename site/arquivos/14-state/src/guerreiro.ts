import type { CondicaoDescanso, Estado, RegistroAcao, Transicao } from "./contratos.js";
import { EstadoNormal } from "./estados.js";

export class Guerreiro {
  readonly #nome: string;
  #estado: Estado;
  readonly #historico: RegistroAcao[] = [];

  // Injeção apenas na construção para variantes; não existe setEstado público.
  constructor(nome: string, estadoInicial: Estado = new EstadoNormal()) {
    const normalizado = nome.trim();
    if (!normalizado) throw new Error("Nome obrigatório.");
    this.#nome = normalizado;
    this.#estado = estadoInicial;
  }

  get nome(): string { return this.#nome; }
  situacao() { return Object.freeze({ estado: this.#estado.nome, intervalosFuria: this.#estado.intervalosFuria }); }
  listarHistorico(): readonly RegistroAcao[] { return [...this.#historico]; }

  atacar(): RegistroAcao {
    const antes = this.#estado.nome;
    return this.#aplicar("atacar", antes, this.#estado.atacar());
  }

  descansar(condicao: CondicaoDescanso): RegistroAcao {
    const antes = this.#estado.nome;
    return this.#aplicar("descansar", antes, this.#estado.descansar(condicao));
  }

  #aplicar(acao: RegistroAcao["acao"], antes: string, decisao: Transicao): RegistroAcao {
    this.#estado = decisao.proximo;
    const registro = Object.freeze({ acao, executada: decisao.executada, antes, depois: this.#estado.nome,
      intervalosFuriaRestantes: this.#estado.intervalosFuria, efeito: decisao.efeito });
    this.#historico.push(registro);
    return registro;
  }
}
