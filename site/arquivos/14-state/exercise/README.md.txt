# Exercício — Estado defensivo

Acrescente `EstadoDefensivo` ao contrato `Estado`, em arquivo separado. Componha um novo guerreiro inicialmente nesse estado. Não crie um `setEstado` público para contornar o ciclo.

Critérios verificáveis:

1. O estado defensivo começa com zero intervalos de fúria.
2. `atacar()` executa um contra-ataque controlado e retorna ao normal, sem iniciar fúria nesse mesmo ato.
3. Descansar sem proteção é recusado e mantém a defesa. Um período completo de descanso protegido, informado conforme o contrato da base, retorna ao normal.
4. Depois do contra-ataque, o próximo ataque normal inicia dois intervalos. Os dois ataques furiosos seguintes ainda terminam em exaustão; a extensão não modifica essa regra.
5. Registre quais arquivos, interfaces e transições existentes precisaram mudar. Diferencie a seleção inicial de uma entrada em defesa durante uma execução já iniciada.

## Resposta comentada e executável

`../solution/defensivo.ts` acrescenta uma classe que implementa a interface existente. `../solution/main.ts` seleciona esse estado pelo parâmetro de construção já disponível em `Guerreiro`; `../solution/defensivo.test.ts` verifica contra-ataque, repouso e retomada integral do ciclo.

Para esta variante inicial, **nenhuma interface, implementação do contexto ou decisão dos três estados da base foi alterada**. Foram acrescentados a classe, o código de composição e seus testes. A extensão usa a transição já definida para voltar ao normal. Isso não prova que qualquer nova transição possa ser incluída sem mudanças: para permitir uma ação pública `defender()` durante o ciclo, seria necessário definir o novo comando no contrato e no contexto, decidir em quais estados ele é permitido e implementar/testar essas decisões nos estados envolvidos. A solução não implementa essa entrada dinâmica e não promete permitir defesa quando exausto.

Execute `npm run solution` e `npm test` na pasta deste projeto. O diagrama principal representa a base; esta classe adicional implementa `Estado` e pode transitar para `EstadoNormal`.
