// Biblioteca legada simulada e fechada para edição pelos consumidores.
// O contrato desta versão informa velocidade em km/h e oferece somente fogo.
export class DragaoAntigo {
  voarVelocidade(): number {
    return 36;
  }

  soltarFogo(alvo: string): { rocha: string; desobstruida: boolean } {
    return { rocha: alvo, desobstruida: true };
  }
}
