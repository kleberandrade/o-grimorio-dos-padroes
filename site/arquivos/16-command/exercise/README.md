# Exercício — Um aviso não pode ser desouvido

Implemente um comando que emita um aviso usando uma porta recebida por composição. Use uma implementação **simulada local**, sem enviar mensagens reais. Na operação de compensação, acrescente uma correção vinculada ao aviso original; não o apague.

Critérios verificáveis:

1. Emitir acrescenta um registro com identidade e texto; o invocador registra o comando somente após o sucesso conhecido.
2. Compensar acrescenta um segundo registro com referência ao primeiro. O aviso original permanece, inclusive sua identidade e conteúdo.
3. Uma falha simulada antes da compensação conserva aviso e entrada de histórico. Uma tentativa manual posterior pode concluir.
4. A mesma instância não emite ou compensa duas vezes após sucesso conhecido. Outra ordem pode emitir o mesmo texto; não prometa deduplicação global.
5. A listagem não permite apagar ou editar o livro interno de avisos. Explique por que isso não certifica entrega ou segurança de um serviço real.

## Resposta comentada

`solution/avisos.ts` define `PortaAvisos`, `AvisosSimulados` e `ComandoAvisar`. O comando recebe a porta e guarda o identificador do aviso emitido. Seu `desfazer()` chama `compensar(id)`; o nome vem da interface comum, mas o efeito é uma **nova ação**, não retorno ao estado sem aviso. O invocador pode retirar a entrada de sua pilha após esse sucesso, enquanto o livro de registros da porta mantém as duas ações. A base não foi alterada para suportar o exercício; a semântica da operação precisa ser explicada ao cliente.

A falha programada por `falharProximaCompensacao()` ocorre antes de acrescentar registro, lança erro e é consumida uma vez. A tentativa manual seguinte pode acrescentar a correção. Isso testa somente essa política simulada. Não modela um serviço que recebeu a correção e perdeu a resposta; nesse cenário, uma retentativa pode duplicar efeitos. Não há rede, persistência, exatamente uma vez ou conhecimento da experiência de uma pessoa. O registro da correção não prova que o aviso tenha sido ignorado.

`solution/avisos.test.ts` verifica registros, falha, repetição e proteção da listagem. Execute `npm test` e `npm run solution`. O programa da solução mostra primeiro a falha, depois os registros original e compensatório. A alternativa mais simples para um único aviso sem histórico é chamar diretamente a porta; introduzir Command se justifica pela necessidade concreta de guardar e acionar a solicitação de modo uniforme.
