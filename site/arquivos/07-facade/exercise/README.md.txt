# Exercício — Tirar a diplomacia do mordomo

Uma proposta quer acrescentar `autorizarTrocaDePrisioneiros()` à fachada de preparação. Separe essa decisão: uma `AutoridadeDiplomatica` deve fornecer a autorização, e uma função externa deve consultá-la antes de pedir a preparação.

Critérios verificáveis:

- `FachadaPreparacao` continua responsável apenas por cozinha, arsenal, arquivo e guarda.
- Uma decisão negativa não chama nenhum subsistema de preparação.
- Uma decisão positiva permite executar `prepararMissao()`, mas preserva seu resultado `parcial` se faltar a peça.
- A decisão vem da autoridade injetada, sem regra política improvisada dentro da fachada.
- Comente quando seria mais simples chamar diretamente um único subsistema.

Compare com `solution/coordenacao.ts` e seus testes; execute `npm run solution`. Tentativas em `exercise/` não são compiladas com a resposta.

## Resposta comentada

`coordenarVisita()` consulta `AutoridadeDiplomatica` e chama a fachada somente quando a autorização externa permite. Ela não negocia nem fabrica o acordo. O resultado da solução distingue autorização de preparação: uma visita pode estar autorizada e continuar com preparação parcial.

Esta separação mantém uma responsabilidade com motivo de mudança diferente fora da fachada. Acrescentar um coordenador para cada chamada trivial também seria excesso: se o objetivo é só buscar um mapa, a chamada direta ao arquivo já é clara. O projeto-base executa e testa essa alternativa.
