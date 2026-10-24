# Exercício — Incluir Curandeiro cobra de todos os visitantes

Acrescente Curandeiro com nome e índice `cuidado` inteiro0..100. Capacidade será `2 × cuidado`; custo será `3 × cuidado + 8`, em unidades convencionais. Não o classifique como mago por cast nem invente que visitantes antigos já saibam visitá-lo.

Critérios:

1. Acrescentar visita tipada ao Curandeiro na interface e ligar seu `aceitar` a ela.
2. Atualizar **todos os visitantes de produção** do universo ampliado: capacidade e custo.
3. Preservar regras dos três tipos anteriores, inclusive seus totais34/49.
4. Com Curandeiro de índice3, acrescentar capacidade6 e custo17: novos totais40/66.
5. Listar alterações necessárias e distinguir adicionar operação de adicionar tipo. Não alegar que a preparação `aceitar` torna ilimitada a expansão de qualquer eixo.

## Resposta comentada e alterações exatas

A solução é uma versão separada para quatro tipos, sem reescrever os arquivos da base:

- `contratos-ampliados.ts`: `VisitanteAmpliado<R>` contém os três métodos antigos mais `visitarCurandeiro`; `MembroAmpliado` aceita esse contrato ampliado.
- `membros-ampliados.ts`: as três classes antigas usam o contrato/import ampliado; seus corpos de despacho permanecem correspondentes aos mesmos ofícios. A nova classe Curandeiro valida/congela seus campos e chama `visitarCurandeiro(this)`.
- `visitantes-ampliados.ts`: **CalcularCapacidade e CalcularCusto** ganham o método do Curandeiro. Nenhum dos dois é omitido ou substituído por fallback zero. O totalizador referencia os contratos ampliados e reutiliza a validação numérica comum.
- `main.ts` e `ampliacao.test.ts`: a composição inclui o novo elemento e verifica visitas, totais e fronteiras.

Se essa mudança fosse feita no universo principal, seria necessário ampliar a interface existente e rever todos os visitantes daquele universo. Nesta versão didática, os arquivos ampliados deixam essa transformação visível e a base antiga continua compilável. Uma operação de crachá adicionada posteriormente também teria de ganhar visita ao novo tipo se migrasse para esse universo.

Os custos de preparação e migração são reais; nada cria critérios de capacidade/consumo de uma profissão automaticamente. A curandeira narrativa pode permanecer em cadastro provisório enquanto não existem regras acordadas. A fórmula do exercício é uma política convencional explícita, não comprovação de valor humano ou justiça distributiva.

Execute `npm test` e `npm run solution`. Não é necessário apagar imports, comentar tipos nem editar a base para fazer a tentativa compilar. Para tipos que mudam com frequência, uma union discriminada ou métodos próprios podem ser uma escolha mais simples, também com seus pontos de atualização.
