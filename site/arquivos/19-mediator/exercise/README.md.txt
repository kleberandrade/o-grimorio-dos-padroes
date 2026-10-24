# Exercício — Abertura não é distribuição de recursos

O conselho recebe a proposta de acrescentar `distribuirCotas` ao mediador de abertura. Extraia essa responsabilidade para uma função separada que planeje cotas por uma política explícita. A base deste projeto já é enxuta e não contém aquele método: a tarefa é implementar a expansão fora dela, em vez de instalar e depois fingir remover uma responsabilidade inexistente.

Critérios:

1. A política recebe unidades disponíveis e pedidos com grupo/quantidade. Aloca por prioridade da ordem recebida, até esgotar o disponível, sem conceder mais que foi solicitado.
2. O resultado informa solicitado, concedido e restante. Inverta a ordem e mostre que essa escolha muda quem recebe quanto; não chame essa regra de justiça universal.
3. Disponível é inteiro seguro não negativo; demanda é inteira segura positiva. Nomes de grupos devem ser não vazios e distintos depois de normalizar espaços.
4. Não mutar entradas; congelar as estruturas de saída declaradas.
5. Planejar cotas não altera pré-condições de abertura e não substitui confirmação dos colegas.

## Resposta comentada

`solution/cotas.ts` contém `planejarCotas`, sem importar ou chamar o mediador. `solution/main.ts` chama a política na composição, e depois executa o protocolo de abertura pelos colegas. A política devolve somente um plano: não transfere água ou material e não garante execução física. A base não foi modificada; a nova função e seu contrato constituem uma responsabilidade separada. Se uma aplicação já tivesse um método equivalente na classe do conselho, a migração incluiria mover o cálculo e atualizar os chamadores — não seria uma extração com zero edições nessa aplicação.

Com dez unidades, prioridade barqueiros8/cultivadores6 concede8/2; ordem inversa concede6/4. É uma regra local visível e contestável, não decisão obrigatória do padrão Mediator. Nenhuma soma de demandas precisa ultrapassar o intervalo seguro: cada concessão é limitada pelo restante disponível. Resultado e itens são congelados, mas não se promete clonagem genérica de recursos ou objetos arbitrários.

`solution/cotas.test.ts` verifica prioridade, conservação do disponível, entradas/saídas, invalidações e independência do estado de abertura. Execute `npm run solution` e `npm test`. Se a necessidade de distribuição ainda não existe, a alternativa mais simples é não acrescentar essa política; um mediador não precisa concentrar todas as decisões do conselho.
