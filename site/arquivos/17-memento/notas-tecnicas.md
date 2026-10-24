# Registro técnico de produção — projeto 17

Escopo exclusivo `code/17-memento`. Orientação: contexto inicial 017, plano/brief/bíblia/outline, adendo Guru, T09 do parecer regente e fonte Medium09 preservada SHA256 `fcbec1b9d0bdb5e0d0b59507dbe910571c6bab2fa1e63eac3e1cbb63cb5e03d5`.

Contrato enviado cedo ao coordenador e escritor: token vazio com captura só no WeakMap privado por diário, cópias declaradas nas fronteiras, restauração exata com perda intencional de edição posterior. Guardião guarda token/rótulo e valida seleção com histórico limitado. Leitura ativa do Originator não é leitura pública de snapshot. Sem proteção prometida contra código hostil no mesmo processo.

Exercício usa wrapper real separado sem leitura/edição, captura inicial e confirmação explícita, recusa de navegação pendente, undo/redo, corte do futuro após nova confirmação e limite incluindo atual. Booleano de checkpoint é identidade de marca privada de versão, não igualdade profunda do conteúdo.

Verificação própria: 15 testes (nove base e seis solução), incluindo restaurar/editar/restaurar o mesmo token, opacidade em execução, origem/cópia/falsificação, cópias/listas, índices, limites, wrapper real, pendência e ramificação. Evidências em `evidence/` registram seis comandos do runner, captura/verificação e cópia isolada com os programas funcionais comparados byte a byte. Hashes são comunicados após captura sem autorreferência aqui. Não houve benchmark, auditoria independente pelo produtor ou aprovação humana atribuída. Outros projetos, fontes do livro e runner permanecem fora deste escopo.
