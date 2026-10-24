# Exercício — A terceira escola

Acrescente uma família de vento em arquivos novos, com `ArmaDeVento`, `ProtecaoDeVento` e `FabricaDeVento`.

Critérios verificáveis:

- A fábrica cria arma e proteção de afinidade `vento` por operações individuais.
- `ensaiarKit()` recebe a nova fábrica sem alteração e retorna a família correta.
- Intensidade positiva finita é preservada; zero, negativo e não finito são rejeitados.
- Proteção de vento rejeita um pulso de brasa ou geada.
- As duas fábricas anteriores e o contrato `FabricaElemental` permanecem idênticos.

Teste sua solução e compare com `solution/vento.ts` e `solution/vento.test.ts`. `exercise/` fica fora do build oficial, para não compilar sua versão e a resposta juntas.

## Resposta comentada

A terceira escola adiciona implementações das categorias já existentes, sem ampliar o contrato da fábrica. `afinidade` é `string` para admitir novas famílias; por isso a compatibilidade é verificada durante o ensaio, sem promessa de rejeição estática da mistura.

Uma nova categoria, por exemplo `Amuleto`, é outro eixo de mudança: exige definir seu contrato, ampliar `FabricaElemental` com `criarAmuleto()`, implementar a operação nas três fábricas, criar os produtos correspondentes e acrescentar testes de interação. O cliente só precisa mudar se passar a usar o amuleto. Não basta acrescentar uma quarta fábrica.

Este exercício pede registrar esse custo, não implementar uma categoria que o caso atual não utiliza. Um construtor direto de par continua preferível quando só há uma família estável e nenhuma necessidade de variação entre famílias.
