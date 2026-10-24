# Exercício — O lugar de um novo elo

Acrescente `PostoUrgente` que trate provisões urgentes até dez unidades. Nos demais pedidos, ele deve devolver `naoTratado` e deixar a cadeia decidir se continua. Preserve as decisões dos handlers da base.

Critérios:

1. Pedido urgente de oito unidades é tratado pelo posto se ele estiver antes da Conselheira.
2. O mesmo pedido é negado pela Conselheira se ela vier antes do posto; o posto não aparece no percurso.
3. Pedido normal ou com mais de dez unidades não é tratado pelo posto. O resultado depende do restante da configuração.
4. Passagens pela galeria interna continuam sendo negadas pela Regência; o posto não cria exceção de segurança com base na urgência.
5. Compare os percursos reais e explique por que reordenar é alterar política, sem dizer que a nova ordem é necessariamente mais justa.

## Resposta comentada

`solution/posto-urgente.ts` implementa o contrato `Handler`; não altera classes existentes nem a implementação da cadeia. A raiz de composição é que acrescenta a instância em duas posições diferentes. A política extraordinária está explícita no novo elo e entra em conflito deliberado com o limite comum de cinco unidades quando ambos poderiam decidir. A cadeia usa a primeira decisão terminal e não resolve essa tensão por si.

`solution/main.ts` executa as duas configurações e publica seus resultados/percursos reais. `solution/posto.test.ts` verifica ordem, limites e preservação da interdição. A composição escolhe uma lista nova; a instância anterior não é reordenada durante processamento.

Execute `npm test` e `npm run solution`. Se a precedência entre regras for indevida para a aplicação, a correção é definir outra política de composição ou outro contrato de decisão — não supor que todo `naoTratado` autorize nem que todo handler deva executar. Para um responsável já conhecido e estável, a chamada direta continua sendo uma alternativa mais simples.
