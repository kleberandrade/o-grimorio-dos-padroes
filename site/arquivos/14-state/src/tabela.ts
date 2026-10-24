export type EstadoTabela = "normal" | "furioso-2" | "furioso-1" | "exausto";

// Alternativa para poucas regras, sem objetos State. Os dois saldos são explícitos.
export function avancarTabela(estado: EstadoTabela, acao: "atacar" | "descansar", protegido = false) {
  if (acao === "descansar") {
    const pode = protegido && (estado === "normal" || estado === "exausto");
    return Object.freeze({ estado: pode ? "normal" as const : estado, executada: pode });
  }
  switch (estado) {
    case "normal": return Object.freeze({ estado: "furioso-2" as const, executada: true });
    case "furioso-2": return Object.freeze({ estado: "furioso-1" as const, executada: true });
    case "furioso-1": return Object.freeze({ estado: "exausto" as const, executada: true });
    case "exausto": return Object.freeze({ estado, executada: false });
  }
}
