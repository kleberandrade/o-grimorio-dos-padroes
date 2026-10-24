# Registro técnico de produção — projeto21

Escopo exclusivo `code/21-iterator`, produzido em23/10/2026. Orientação: contexto inicial021, plano/bíblia/outline/brief/adendo Guru, T12/T17 e Medium03 SHA256 `73bc156dfea8b93f6e252180531eedbb82c2894868cac37694732836257a93f4`.

Contrato comunicado cedo: array e lista encadeada reais, inserção explícita, snapshot ao criar percurso e índices independentes. Contrato local proximo/fim/ordem não é IteratorResult nativo. Ponte Symbol.iterator e gerador estão somente na solução; a fábrica captura antes do corpo preguiçoso. Edição antes do primeiro next e encerramento/reinício foram testados, sem promessa remota/assíncrona.

Consulta primária efetiva em23/10/2026: TC39, interfaces de iteração, forEach/map, for-of e GeneratorStart/Resume/Abrupt; URLs e evidências em `referencias.json`. Documento vivo exibia ECMAScript2027; runtime fixado permanece Node26.10.0. Exemplo mínimo real instrumenta Symbol.iterator de array: forEach/map não o chamam; for...of chama. Nenhuma equivalência automática de callbacks internos com protocolo Iterator.

Verificação própria: 18 testes, sendo12 base e seis solução. Cobrem dois armazenamentos, ordem, vazio/fim repetido, posições independentes, snapshot pré-consumo, atualização/validação/cópias, protocolo nativo, momento da captura no wrapper/gerador e break/return. Seis comandos runner e cópia isolada são registrados em `evidence/`, com stdout base/solução comparados byte a byte. Hashes efetivos serão comunicados após captura sem autorreferência aqui. Não houve benchmark ou auditoria independente atribuída ao produtor. Não alterar nem recapturar projetos anteriores, runner compartilhado, planejamento ou manuscrito por esta entrega.
