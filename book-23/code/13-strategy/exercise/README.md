# Exercício — A estratégia pode ser uma função

Reimplemente a técnica de arco como `EstrategiaFuncional = (alvo: Alvo) => ResultadoAtaque`. Use os mesmos limites, mensagens e dados do `AtaqueArco`. Primeiro chame a função diretamente; depois mostre um contexto que recebe uma função e permite trocá-la.

Critérios verificáveis:

- Função e objeto devolvem resultados equivalentes para alvo adequado, perto demais, longe demais e reforçado.
- O mesmo contrato de dados e resultado continua explícito.
- Trocar a função preserva a identidade e o nome do contexto funcional.
- Resultado fornecido pelas implementações do exercício mantém os custos e congelamento do projeto.
- Explique quando uma chamada direta à função basta e quando guardar uma política substituível no contexto é útil.

Compare com `solution/funcional.ts` e `solution/funcional.test.ts`; execute `npm run solution`. Tentativas em `exercise/` ficam fora da compilação da solução oficial.

## Resposta comentada

`ataqueArcoFuncao()` implementa as mesmas regras do objeto e é testada contra ele. JavaScript permite passar a função como valor, sem criar uma classe só para uma operação. A intenção de encapsular uma política substituível continua sendo Strategy; funções e objetos são formas de representá-la.

`criarContextoFuncional()` guarda a função numa variável de closure. O objeto retornado é congelado, mas a operação explícita de troca altera essa variável, não as propriedades do objeto. Isso não torna o contexto puro ou sem estado; torna a escolha de política explícita. A nova função precisa cumprir o contrato, assim como uma nova classe.

Se a aplicação chama sempre a mesma função estável, não precisa de um contexto de troca. Uma seleção curta e clara também pode ser suficiente quando existem poucas opções estáveis; a presença de um `if` ou `switch` não exige por si só um padrão.
