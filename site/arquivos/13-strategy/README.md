# 13 — Strategy: Táticas de ataque intercambiáveis

`Combatente` compõe uma `EstrategiaDeAtaque` e delega a operação sem conhecer Espada, Arco ou Magia. A estratégia recebe um alvo estruturado e devolve resultado e custo. A troca altera a política, preservando a identidade e o nome do contexto.

## Executar

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, lock próprio. Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books:

```sh
node book-23/scripts/projetos.mjs 13 install
node book-23/scripts/projetos.mjs 13 check
node book-23/scripts/projetos.mjs 13 capture
node book-23/scripts/projetos.mjs 13 verify
```

O build limpa `dist`, compila ES2022/ESM com TypeScript estrito e testa o JavaScript emitido com Node. Não importa capítulos vizinhos; `exercise/` fica fora da compilação da solução oficial.

## Fontes e papéis

- `src/contratos.ts`: Strategy, alvo estruturado e resultado discriminado.
- `src/estrategias.ts`: três políticas concretas com o mesmo objetivo de ataque no ensaio.
- `src/combatente.ts`: Context com referência injetada e troca explícita.
- `src/resultado.ts`: normalização de entrada e resultados congelados.
- `src/main.ts`: inadequação, troca para arco, resistência que pede magia e alternativa próxima de menor custo.
- `test/taticas.test.ts`: identidade, contrato, extensão, fronteiras, custo e falhas.
- `exercise/` e `solution/`: técnica como função, chamada direta e contexto funcional.
- `diagram.mmd`: fonte lógica do projeto-base; renderização e QA visual na etapa de arte.
- `evidence/`: stdout real, testes, manifesto e execução em cópia isolada.

## Regras do ensaio

O alvo tem nome, distância não negativa finita em metros e resistência `comum` ou `reforcada`. Nome vazio ou distância inválida são erros de entrada. Nome e dados são copiados para um valor congelado antes da delegação; as estratégias concretas também validam quando chamadas diretamente.

- **Espada:** alcance de 0 a 2 m, resistência comum, custo 1.
- **Arco:** intervalo de 2 a 30 m, resistência comum, custo 2.
- **Magia:** alcance de 0 a 15 m, ambas as resistências, custo 5.

Os extremos são inclusivos. Técnica inadequada devolve estado `inadequado`, custo zero e motivo, sem declarar o efeito executado. Técnica adequada devolve estado `executado`, técnica, alvo, custo e efeito. Custos são índices inteiros do modelo: não há estoque, flechas, reserva de mana ou dedução automática implementados. O código não garante acerto físico, abertura de passagem ou segurança de um alvo real.

A mesma intenção não significa que qualquer técnica sirva a qualquer entrada. Todas compartilham o contrato, inclusive a possibilidade de inadequação. Um alvo comum a 2 m admite as três, com custos diferentes; quem escolhe precisa considerar o contexto. O programa não seleciona automaticamente a técnica ótima nem troca a referência após rejeição ou exceção.

## Troca, dados e extensões

`trocarEstrategia()` altera somente a referência do contexto. `estrategiaAtual()` permite observar essa identidade; o teste prova que uma estratégia nova funciona sem editar `Combatente`. O contexto recebe a dependência por contrato, sem importar classes concretas. Uma exceção de estratégia externa é propagada e não dispara fallback.

As estratégias fornecidas criam resultados congelados, independentes entre chamadas, e não modificam o alvo ou resultados antigos. Isso não valida a implementação de qualquer estratégia externa nem garante pureza, ausência de I/O ou segurança de código arbitrário. Campos `#` mantêm o estado interno das classes fornecidas; tipos TypeScript não substituem validação de JSON ou fronteiras de aplicação.

A solução demonstra uma função de arco com os mesmos dados, resultado e regras, testada contra o objeto. Uma chamada direta à função é uma alternativa real para uma operação estável. O contexto funcional conserva a intenção de substituir política e usa uma closure; o objeto congelado não torna imutável a variável de função que a operação de troca modifica explicitamente.

## Custos e comparações

Strategy acrescenta contratos, objetos ou funções e a responsabilidade de escolher. Pode ser excesso quando só há uma operação estável ou uma seleção curta de opções claras. Não se precisa transformar todo ramo condicional em uma classe, nem prometer que todas as técnicas sejam equivalentes em efeito para todos os alvos.

State organiza comportamento condicionado pelo estado e por suas transições. Strategy encapsula políticas intercambiáveis para uma operação. Quem decide trocar pode variar nos dois casos; “um muda sozinho e o outro pelo cliente” é uma heurística, não definição absoluta. Template Method fixa um esqueleto herdado e permite variar passos; aqui o contexto delega a política inteira por composição.

Bridge separa dois eixos de abstrações e implementações que precisam evoluir, como formas e essências no projeto anterior. Aqui não há uma segunda hierarquia de formas: há um contexto e uma família de políticas para seu ataque. Desenho semelhante e substituição em execução não determinam a intenção.

As regras de distância/resistência são ficcionais. Não se usa hashing como alternativa equivalente a criptografia reversível: um contrato comum precisa preservar a finalidade, não apenas um nome de método. Testes e hashes ligam saídas às fontes executadas; não substituem auditoria técnica independente nem aprovação autoral, sem promessas de desempenho ou segurança.
