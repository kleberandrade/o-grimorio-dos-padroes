# Exercício — Undo/redo com confirmação explícita

Implemente `LinhaDoTempo` recebendo a porta estreita real de memórias, sem receber `Diario` com seus métodos de leitura e edição. O histórico deve ser limitado, e uma edição posterior a undo deve abrir nova ramificação quando confirmada.

Critérios verificáveis:

1. Na construção, capture automaticamente o estado atual como checkpoint `Inicial`, com cursor zero. Esse ponto conta no limite.
2. O cliente edita o diário e chama `confirmar(rotulo)`. Só essa confirmação captura a edição como ponto navegável. Sem nova edição, confirmar retorna `false` e não duplica um ponto.
3. Undo e redo recusam navegar se houver edição pendente, inclusive nas bordas; não descartam texto silenciosamente. O usuário precisa confirmar antes de navegar. Não há descarte implícito ou comando adicional de descartar nesta solução.
4. Sem pendência, undo/redo restauram o checkpoint vizinho, movem cursor só depois do sucesso e retornam `false` na borda correspondente.
5. Uma edição feita após undo torna a navegação pendente; **confirmá-la** corta os checkpoints à frente e cria o novo futuro. Antes disso, os metadados da ramificação antiga ainda existem, embora redo esteja bloqueado pela pendência.
6. O limite inclui o ponto atual. Excedê-lo remove o mais antigo e reajusta índices/cursor. Limite um mantém somente o atual e não permite undo.

## Resposta comentada

`solution/linha-do-tempo.ts` mantém apenas tokens, rótulos e cursor. O estado atual entra na linha do tempo no construtor e depois por confirmações explícitas; não é capturado automaticamente quando se clica em undo. Isso evita fingir que todo texto ativo já estava salvo.

O booleano `correspondeCheckpoint` consulta a marca de versão privada do Originator, sem acesso ao payload. Ele não compara textos: uma edição com valores iguais também cria uma nova versão e exige confirmação. `confirmar` valida o rótulo e cria o token antes de cortar o futuro; undo/redo restauram antes de mover cursor. As garantias valem para a porta fornecida e operações síncronas deste modelo; uma implementação externa com efeitos ou falhas arbitrárias tem seus próprios limites.

A base já continha operações de captura/restauração, marca de versão e wrapper necessárias a esse recorte. A solução acrescenta o controlador de checkpoints e seus testes, sem instalar getter bruto de estado nem alterar a base. Não há persistência, múltiplos editores concorrentes, deduplicação por conteúdo ou recuperação do futuro eliminado pelo controlador. Tokens mantidos externamente não são revogados pelo corte.

Execute `npm run solution` para observar A → B → C, undo para B, redo para C e nova ramificação B → D sem redo para C. `npm test` verifica estado completo, pendência, limite/cursor, confirmação sem edição e listagens. Uma simples string anterior continua sendo uma alternativa legítima para um único estado sem essa política de histórico.
