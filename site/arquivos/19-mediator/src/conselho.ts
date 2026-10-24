import type { Despacho, Equipe, Estado, Evento, Mediador, Resultado } from "./contratos.js";

function mensagem(erro: unknown): string {
  try {
    if (erro instanceof Error) {
      const valor: unknown = erro.message;
      if (typeof valor === "string") return valor;
    }
  }
  catch { return "Falha ao ler mensagem do erro."; }
  return "Falha sem mensagem de Error.";
}

export class ConselhoMediator implements Mediador {
  #equipe: Equipe | null = null;
  #estado: Estado = "pronto";
  #despachando = false;
  readonly #despachos: Despacho[] = [];

  conectar(equipe: Equipe): void {
    if (this.#equipe !== null) throw new Error("Equipe já conectada; nova operação exige nova composição.");
    this.#equipe = Object.freeze({ cultivadores: equipe.cultivadores, barqueiros: equipe.barqueiros, guarda: equipe.guarda });
  }

  notificar(evento: Evento): Resultado {
    if (!this.#equipe) return this.#resultado("rejeitado", "Equipe não conectada.");
    if (this.#despachando) return this.#resultado("rejeitado", "Notificação durante despacho recusada.");
    const equipe = this.#equipe;
    switch (evento.tipo) {
      case "pedido":
        if (this.#estado !== "pronto") break;
        this.#estado = "aguardando-inspecao";
        return this.#encaminhar("cultivadores", "solicitarInspecao", () => equipe.cultivadores.solicitarInspecao());
      case "inspecao":
        if (this.#estado !== "aguardando-inspecao") break;
        if (typeof evento.aprovada !== "boolean") return this.#resultado("rejeitado", "Confirmação requer booleano.");
        if (!evento.aprovada) return this.#recusar("Inspeção recusou abertura.");
        this.#estado = "aguardando-amarras";
        return this.#encaminhar("barqueiros", "solicitarAmarras", () => equipe.barqueiros.solicitarAmarras());
      case "amarras":
        if (this.#estado !== "aguardando-amarras") break;
        if (typeof evento.confirmadas !== "boolean") return this.#resultado("rejeitado", "Confirmação requer booleano.");
        if (!evento.confirmadas) return this.#recusar("Amarras não confirmadas; operação encerrada.");
        this.#estado = "aguardando-autorizacao";
        return this.#encaminhar("guarda", "solicitarAutorizacao", () => equipe.guarda.solicitarAutorizacao());
      case "autorizacao":
        if (this.#estado !== "aguardando-autorizacao") break;
        if (typeof evento.concedida !== "boolean") return this.#resultado("rejeitado", "Confirmação requer booleano.");
        if (!evento.concedida) return this.#recusar("Guarda negou autorização.");
        return this.#encaminhar("guarda", "abrir", () => { equipe.guarda.abrir(); this.#estado = "aberto"; });
    }
    return this.#resultado("rejeitado", "Evento fora da etapa ou operação já iniciada/encerrada.");
  }

  snapshot() { return Object.freeze({ estado: this.#estado, despachos: Object.freeze([...this.#despachos]) }); }

  #recusar(motivo: string): Resultado {
    this.#estado = "recusado";
    return this.#resultado("processado", motivo);
  }
  #resultado(status: Resultado["status"], motivo: string): Resultado {
    return Object.freeze({ status, estado: this.#estado, motivo });
  }
  #encaminhar(destinatario: Despacho["destinatario"], acao: Despacho["acao"], executar: () => void): Resultado {
    this.#despachando = true;
    try {
      executar();
      this.#despachos.push(Object.freeze({ destinatario, acao, status: "concluiu" }));
      return this.#resultado("processado", "Ação dirigida concluída no modelo.");
    } catch (erro: unknown) {
      this.#estado = "falhou";
      this.#despachos.push(Object.freeze({ destinatario, acao, status: "falhou" }));
      return this.#resultado("falhou", mensagem(erro));
    } finally { this.#despachando = false; }
  }
}
