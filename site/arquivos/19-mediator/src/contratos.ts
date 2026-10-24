export type Estado = "pronto" | "aguardando-inspecao" | "aguardando-amarras" | "aguardando-autorizacao"
  | "aberto" | "recusado" | "falhou";
export type Evento = { readonly tipo: "pedido" } | { readonly tipo: "inspecao"; readonly aprovada: boolean }
  | { readonly tipo: "amarras"; readonly confirmadas: boolean } | { readonly tipo: "autorizacao"; readonly concedida: boolean };
export interface Resultado {
  readonly status: "processado" | "rejeitado" | "falhou";
  readonly estado: Estado;
  readonly motivo: string;
}
export interface Mediador { notificar(evento: Evento): Resultado; }
export interface Equipe {
  readonly cultivadores: { solicitarInspecao(): void };
  readonly barqueiros: { solicitarAmarras(): void };
  readonly guarda: { solicitarAutorizacao(): void; abrir(): void };
}
export interface Despacho {
  readonly destinatario: "cultivadores" | "barqueiros" | "guarda";
  readonly acao: "solicitarInspecao" | "solicitarAmarras" | "solicitarAutorizacao" | "abrir";
  readonly status: "concluiu" | "falhou";
}
