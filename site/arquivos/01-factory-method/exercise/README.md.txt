# Exercício — O canal de corvo

Implemente `MensageiroDeCorvo` e `CriadorDeCorvo` em arquivos novos. O produto deve implementar `Mensageiro`; o criador deve estender `CriadorDeNotificacoes` e sobrescrever somente `criarMensageiro()`.

Critérios verificáveis:

- `avisarGuilda()` continua idêntica e recebe o novo criador.
- Um envio válido aparece no correio com canal `corvo`, destino e mensagem corretos.
- Espaços externos são removidos pela operação comum herdada.
- Destino ou mensagem vazios lançam o erro existente e não geram entrega.
- Nenhum `switch`, parâmetro discriminador ou alteração em `src/criadores.ts` é necessário.

Compare sua solução com `../solution/corvo.ts` e os testes em `../solution/corvo.test.ts`. Para praticar, mantenha seus arquivos em `exercise/` e compile com uma configuração própria: esse diretório não participa do build oficial, evitando colisões com a resposta.

A solução usa herança para variar a criação, preservando a operação. Se o problema fosse apenas escolher um rótulo de canal, passar esse rótulo a uma função seria suficiente; a hierarquia aqui torna explícito o mecanismo do Factory Method, sem afirmar que é necessária para todo sistema de mensagens.
