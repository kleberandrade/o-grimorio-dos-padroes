# Registro técnico de produção — projeto 18

Escopo exclusivo `code/18-observer`, data de produção 23/10/2026. Orientação: contexto inicial 018, plano/brief/bíblia/outline, adendo Guru, T12/T17 e Medium18 preservado SHA256 `5b84423cfc233b7242f0e78b64bfd32d5fe56c6cdb590405382cd47a8e7c4dcc`. A mudança narrativa para rajada local foi alinhada com escritor e coordenador; não altera contratos ou fontes históricas por esta entrega.

Contrato comunicado cedo: função por identidade ativa, unsubscribe por identidade da inscrição, ordem e snapshot fixados no início, falhas síncronas coletadas e reentrância recusada sem fila. Mesmo callback pode ser reinscrito depois de removido; handle antigo não o remove. Relatório não certifica ação física ou conclusão de Promises. Callback void não proíbe async em TypeScript; não há espera nem tratamento de rejeição de Promise. Normalização de erro tem fallback se a leitura da própria mensagem falhar.

Exercício acrescenta controlador de vínculos de turno por composição, sem alterar a base: limpeza repetida, terceiros preservados, encerramento durante snapshot e reinscrição em novo turno. Não usa API nativa/framework externo e não repete citação histórica inventada da fonte.

Verificação própria: 17 testes, sendo 13 base e quatro solução. Seis comandos runner e instalação/testes/programas em cópia isolada são registrados em `evidence/`; as saídas funcionais são comparadas byte a byte. Hashes efetivos são comunicados depois da captura, sem autorreferência neste arquivo. Não houve benchmark ou atribuição de auditoria independente/humana. Outros projetos, candidato literário, planejamentos e runner compartilhado permanecem fora deste escopo.
