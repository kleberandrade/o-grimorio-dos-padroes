import type { Mediador, Resultado } from "./contratos.js";

export class Barqueiros {
  readonly #mediador: Mediador;
  #solicitacoesAmarras = 0;
  constructor(mediador: Mediador) { this.#mediador = mediador; }
  pedirAbertura(): Resultado { return this.#mediador.notificar({ tipo: "pedido" }); }
  confirmarAmarras(confirmadas: boolean): Resultado { return this.#mediador.notificar({ tipo: "amarras", confirmadas }); }
  solicitarAmarras(): void { this.#solicitacoesAmarras += 1; }
  snapshot() { return Object.freeze({ solicitacoesAmarras: this.#solicitacoesAmarras }); }
}

export class Cultivadores {
  readonly #mediador: Mediador;
  #solicitacoesInspecao = 0;
  constructor(mediador: Mediador) { this.#mediador = mediador; }
  confirmarInspecao(aprovada: boolean): Resultado { return this.#mediador.notificar({ tipo: "inspecao", aprovada }); }
  solicitarInspecao(): void { this.#solicitacoesInspecao += 1; }
  snapshot() { return Object.freeze({ solicitacoesInspecao: this.#solicitacoesInspecao }); }
}

export class Guarda {
  readonly #mediador: Mediador;
  readonly #falharAbertura: boolean;
  #solicitacoesAutorizacao = 0;
  #acionamentos = 0;
  #aberta = false;
  constructor(mediador: Mediador, falharAbertura: boolean = false) {
    this.#mediador = mediador; this.#falharAbertura = falharAbertura;
  }
  confirmarAutorizacao(concedida: boolean): Resultado { return this.#mediador.notificar({ tipo: "autorizacao", concedida }); }
  solicitarAutorizacao(): void { this.#solicitacoesAutorizacao += 1; }
  abrir(): void {
    this.#acionamentos += 1;
    if (this.#falharAbertura) throw new Error("Falha simulada após iniciar acionamento.");
    this.#aberta = true;
  }
  snapshot() { return Object.freeze({ solicitacoesAutorizacao: this.#solicitacoesAutorizacao,
    acionamentos: this.#acionamentos, aberta: this.#aberta }); }
}
