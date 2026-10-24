# 14 — State: O Livro das Formas Mutáveis

Projeto independente em TypeScript. `Guerreiro` conserva sua identidade e delega `atacar()` e `descansar(condicao)` ao objeto `Estado` atual. Cada estado devolve uma `Transicao`; o contexto aplica a decisão e registra dados consultáveis, inclusive recusas. A classe e o protótipo do guerreiro não são trocados.

O nome usado neste projeto é **Dário**, conforme `../../docs/adendo-nomes-personagens-01.md`. O planejamento congelado permanece como registro histórico; este exemplo aplica a decisão nominal do adendo.

## Executar

Ambiente declarado e utilizado: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3** e `@types/node` **26.0.0**. Use a versão em `.nvmrc`; o lock pertence somente a este projeto.

Na pasta `book-23/code/14-state`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório:

```sh
node book-23/scripts/projetos.mjs 14 capture
node book-23/scripts/projetos.mjs 14 verify
```

O runner compila e testa somente este projeto. `evidence/stdout.txt` e `evidence/solution-stdout.txt` preservam saídas reais, sem os banners do npm. `evidence/manifest.json` relaciona hashes dos fontes e saídas; `evidence/isolation.json` registra uma cópia temporária executada sem acesso aos outros projetos do livro. Capturar novamente produz novas evidências; não substitui uma revisão independente.

## Política do ciclo

1. `new Guerreiro("Dário")` começa normal, com zero intervalos de fúria.
2. O primeiro `atacar()` executa **um golpe normal** e entra em fúria com **dois intervalos intactos**.
3. O ataque seguinte executa um golpe furioso e deixa um intervalo.
4. Outro ataque executa o segundo golpe furioso e entra em exaustão, com zero intervalos.
5. Em exaustão, todo ataque é recusado: a tentativa aparece no histórico com `executada: false`, sem efeito de golpe nem consumo adicional.
6. Somente ataques furiosos consomem os intervalos. Tentar descansar em fúria é recusado e preserva o contador, com qualquer condição de proteção.
7. Em exaustão, `descansar({ protegido: true })` representa **um período completo de repouso protegido já cumprido no domínio externo** e retorna ao normal. Sem proteção informada, recusa. No normal, o mesmo repouso protegido é aceito e conserva o estado; sem proteção, recusa.

O booleano é uma informação recebida pelo modelo. O programa não mede duração, autentica proteção, simula ameaça, cura o corpo ou comprova repouso real. Não há temporizador nem reserva física ou mágica sendo subtraída. `efeito` descreve a ação modelada, sem operar objetos físicos.

`RegistroAcao` contém ação, aceitação, estado anterior, estado posterior, intervalos restantes e efeito. `situacao()` devolve um snapshot congelado. O histórico devolve uma nova lista de registros congelados; alterações na lista devolvida não alteram a lista interna. O programa funcional mostra três golpes e uma tentativa recusada, seguida de dois pedidos de descanso, um recusado e outro aceito.

## Estrutura e limites da extensão

- `src/contratos.ts`: `Estado`, `Transicao`, condição de descanso e registro.
- `src/estados.ts`: `EstadoNormal`, `EstadoFurioso` e `EstadoExausto`.
- `src/guerreiro.ts`: contexto que delega, aplica a transição e guarda histórico.
- `src/tabela.ts`: alternativa menor com tabela/switch, exercitada contra todas as combinações de estados e ações da base.
- `solution/defensivo.ts`: extensão separada do exercício.
- `diagram.mmd`: relações editáveis da implementação base.

Os estados fornecidos são objetos congelados com campos escalares. Consumir fúria produz outro objeto de estado; compartilhar o estado inicial entre dois guerreiros não compartilha um contador mutável. O contexto não expõe `setEstado` nem um método público de aplicação: `#estado` e `#aplicar` são privados em execução JavaScript. A injeção de um estado inicial é uma escolha de composição feita na construção, sem troca pública durante o ciclo.

As regras do ciclo valem para as implementações fornecidas sem adulteração externa. O contrato permite outras implementações de `Estado`: o TypeScript não prova que elas sejam imutáveis, honestas ou livres de efeitos. Uma extensão pode definir outras regras. Exceções lançadas por um estado são propagadas sem acrescentar registro ou aplicar uma transição; isso não desfaz efeitos que a própria extensão tenha realizado fora do contexto. Não há promessa de fronteira de segurança contra código arbitrário que modifique protótipos ou dependências.

Cada ação da base consulta um único estado e acrescenta um registro. O histórico cresce com todas as tentativas; `listarHistorico()` copia essa lista e custa proporcionalmente ao seu tamanho. A criação de estados imutáveis tem custo de alocação. Não há medição de desempenho nem afirmação de ganho.

## Quando usar outra solução

`src/tabela.ts` é uma alternativa legítima para estas poucas regras: mantém a transição visível sem distribuir comportamento em classes. Uma máquina de estados finita pode ser implementada assim, sem usar State GoF. State passa a ajudar quando os comportamentos e suas transições se organizam melhor em objetos coesos; não exige uma classe para cada valor de uma variável.

Strategy encapsula políticas ou algoritmos intercambiáveis para um objetivo. Aqui as mesmas ações passam a ter comportamentos próprios de uma etapa do ciclo de vida, e as decisões produzem transições. A intenção e as regras diferenciam os padrões; quem inicia uma troca não constitui uma regra absoluta de distinção. Ambos podem usar composição e delegação.

## Exercício

Leia `exercise/README.md`. A solução implementa um estado defensivo **selecionado na construção**, com contra-ataque e saída por repouso protegido. Nenhum comando para entrar em defesa durante um ciclo em andamento é implementado. O custo e esse limite estão explicitados no exercício, sem abrir um atalho para apagar a exaustão.
