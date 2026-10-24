export function validarVelocidade(valor: number): void {
  if (!Number.isFinite(valor) || valor < 0) {
    throw new Error("Velocidade deve ser não negativa e finita.");
  }
}

export function normalizarAlvo(alvo: string): string {
  const nome = alvo.trim();
  if (!nome) throw new Error("Alvo de rocha obrigatório.");
  return nome;
}
