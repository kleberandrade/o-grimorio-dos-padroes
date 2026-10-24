# Exercício — A dependência sai do esconderijo

A base já injeta `Registro` em `EquipeDeComportas` e recebe essa dependência em `montarCasaDeControle(registro)`. Acrescente uma função de entrada `iniciarCasa()` que escolhe o ciclo padrão na raiz e também aceita uma instância explícita para teste ou outra casa de controle. O serviço fornecido não contém acesso global a ser removido.

Critérios verificáveis:

- Serviços não importam o módulo de acesso compartilhado.
- Duas composições com o ciclo padrão recebem a mesma referência no mesmo contexto de módulo.
- Passar dois `new RegistroEmMemoria()` diferentes mantém históricos independentes.
- Mudar o turno da equipe Sul não altera a equipe Norte, embora ambas possam compartilhar o registro de ordens.
- Testes não precisam apagar ou reiniciar estado global.
- Explique o que continua singleton ao acrescentar a escolha padrão na raiz, mantendo os serviços sem acesso ao módulo compartilhado.

Compare com `solution/raiz.ts` e `solution/raiz.test.ts`; execute `npm run solution`. Tentativas em `exercise/` não participam do build oficial.

## Resposta comentada

`iniciarCasa(registro = obterRegistroCompartilhado())` concentra a escolha na raiz e delega a montagem a `montarCasaDeControle(registro)`. O serviço depende de um contrato e pode receber um registro novo ou substituto. O parâmetro padrão não transforma a raiz em um registro substituível por configuração externa automaticamente: a substituição ocorre quando o chamador passa explicitamente outra implementação.

O registro padrão continua compartilhado por uma avaliação do módulo neste contexto. Injeção torna a dependência visível; não muda sozinha o ciclo de vida do objeto. Se o requisito não pede uma API de acesso compartilhado, criar uma instância com `new` na raiz e passá-la aos serviços é uma alternativa mais simples.
