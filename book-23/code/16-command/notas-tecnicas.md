# Registro técnico de produção — projeto 16

Escopo exclusivo `code/16-command`. Orientação: contexto inicial 016, plano/brief/bíblia/outline, adendo Guru e fonte Medium **20.txt** (Command), preservada com SHA256 `b27e2490ded98f9949f318c636559916e5194c75b5e384028b931760095c3fe3`. A fonte 16.txt é Builder e não orienta este projeto.

Contrato compartilhado cedo com coordenador e escritor: parcelas12/4/8, reserva identificada e cancelamento integral condicionado a parcela intacta, sem inversa da forja. Histórico só guarda execução bem-sucedida e só remove após inversa bem-sucedida; poda não desfaz efeito. Comando tem uso único após sucesso, sem redo; tentativa de execução que falhou antes do efeito pode ser refeita. Snapshot anterior é registrado como proveniência e não sobrescreve operações posteriores.

O exercício simula aviso e compensação adicional vinculada em memória; não há rede ou mensagem real. A interface de comando é reutilizada, com diferença semântica explícita entre compensação e restauração. Falha da compensação mantém histórico e evidência original.

Verificação própria: 17 testes de comportamento, incluindo quatro da solução. Runner install/check/run/solution/capture/verify e cópia isolada são registrados em `evidence/`. As saídas funcionais são comparadas byte a byte; hashes efetivos são comunicados após captura, evitando autorreferência neste arquivo. Nenhum artefato anterior, runner compartilhado, candidato, planejamento ou manifesto editorial é alterado por esta entrega. Revisão independente e aprovação humana permanecem etapas distintas.
