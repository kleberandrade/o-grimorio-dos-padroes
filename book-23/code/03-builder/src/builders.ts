import type { DadosEmConstrucao, Equipamento, EtapasDeExpedicao, FichaDePersonagem, Missao } from "./contratos.js";
import { validarECopiarFicha } from "./validacao.js";

// Compartilha o rascunho e as regras das etapas, sem expor o estado mutável.
abstract class ConstrutorBase implements EtapasDeExpedicao {
  #dados: DadosEmConstrucao = { equipamentos: [] };

  reiniciar(): this {
    this.#dados = { equipamentos: [] };
    return this;
  }

  definirIdentidade(nome: string, classe: string): this {
    this.#dados.nome = nome;
    this.#dados.classe = classe;
    return this;
  }

  definirVida(vida: number): this {
    this.#dados.vida = vida;
    return this;
  }

  definirMissao(missao: Missao): this {
    this.#dados.missao = missao;
    return this;
  }

  adicionarEquipamento(equipamento: Equipamento): this {
    // Copia na entrada: mudanças do chamador antes do build não afetam o rascunho.
    this.#dados.equipamentos.push({ nome: equipamento.nome, protecoes: [...equipamento.protecoes] });
    return this;
  }

  protected concluirFicha(): FichaDePersonagem {
    return validarECopiarFicha(this.#dados);
  }
}

export class PersonagemBuilder extends ConstrutorBase {
  build(): FichaDePersonagem {
    // Não reseta: cada build valida e devolve um novo snapshot profundamente congelado.
    return this.concluirFicha();
  }
}

export class RelatorioBuilder extends ConstrutorBase {
  build(): string {
    const ficha = this.concluirFicha();
    const itens = ficha.equipamentos.map((item) => item.nome).join(", ");
    return `${ficha.nome} | ${ficha.classe} | vida ${ficha.vida} | missão ${ficha.missao} | ${itens}`;
  }
}
