// Segundo fornecedor simulado. A velocidade retornada está em nós (knots).
export class DragaoMaritimo {
  velocidadeEmNos(): number { return 10; }

  aquecerRocha(identificador: string): { identificador: string; liberada: boolean } {
    return { identificador, liberada: true };
  }
}
