# 07 — Facade: Preparação de uma missão

`FachadaPreparacao.prepararMissao()` oferece uma operação de alto nível para quatro subsistemas: cozinha, arsenal, arquivo e guarda. O resultado descreve cada etapa e distingue preparação pronta de parcial. O cliente não precisa repetir o protocolo nem interpretar quatro chamadas isoladas para descobrir o que ficou pendente.

## Executar

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, lock independente. Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books:

```sh
node book-23/scripts/projetos.mjs 07 install
node book-23/scripts/projetos.mjs 07 check
node book-23/scripts/projetos.mjs 07 capture
node book-23/scripts/projetos.mjs 07 verify
```

O build limpa `dist`, compila módulos ES2022/ESM com TypeScript estrito e roda testes Node sobre o JavaScript emitido. Não há importações de outros capítulos. `exercise/` fica fora da compilação da resposta.

## Fontes e papéis

- `src/contratos.ts`: interfaces dos subsistemas, pedido e estados por etapa.
- `src/fachada.ts`: Facade e protocolo de preparação.
- `src/subsistemas-em-memoria.ts`: implementações locais com estado observável; funções e objetos, sem hierarquia de classes para cada serviço.
- `src/main.ts`: cenário pronto e cenário sem peça, com resultados e efeitos reais do simulador.
- `test/preparacao.test.ts`: dados, ordem, dependências, etapas parciais, efeitos persistentes, erros, repetição e alternativa direta.
- `exercise/` e `solution/`: autorização diplomática separada da preparação e testes executáveis.
- `diagram.mmd`: relações lógicas editáveis; renderização e QA visual na etapa própria.
- `evidence/`: stdout real, testes, manifesto e execução numa cópia isolada.

## Protocolo, efeitos e estados

O pedido contém missão, número de refeições, peça e rota. Nomes são normalizados; nomes vazios ou refeições que não sejam inteiros não negativos seguros são rejeitados antes dos efeitos. A sequência desta operação é cozinha → arsenal → arquivo → guarda. Arquivo pode ser consultado mesmo quando falta a peça; guarda só é chamado depois de obter uma reserva e um mapa. A guarda do simulador recusa um mapa de outra rota.

Os estados por etapa significam:

- `concluida`: a operação retornou normalmente com seu resultado esperado.
- `pendente`: faltou um recurso ou uma dependência; a peça não estava disponível ou a guarda ainda precisa de peça e mapa.
- `ignorada`: nenhuma refeição foi pedida, então a cozinha não foi acionada.
- `falhou`: uma chamada lançou uma exceção. Isso **não garante ausência de efeitos**, pois o subsistema pode alterar estado e depois falhar.

O resultado geral é `pronta` quando todas as etapas estão concluídas ou legitimamente ignoradas; caso contrário, é `parcial`. A preparação da passagem não depende das refeições no modelo, então uma falha na cozinha não bloqueia essa tarefa independente; o resultado geral continua parcial.

O simulador mantém registros de refeições, reservas, mapas e passagens, além de um histórico de chamadas e estoque de peças. Reservar uma peça disponível remove uma unidade do estoque. As consultas devolvem cópias; o resultado da fachada e suas etapas são congelados em execução. Os subsistemas continuam acessíveis diretamente e o teste de consulta ao arquivo demonstra uma tarefa que dispensa fachada.

## Falha, repetição e fronteiras

Não há transação ou rollback. Se o ferreiro falha, as refeições já preparadas permanecem; o mapa ainda pode ser obtido e a guarda fica pendente. Se o arquivo falha, a reserva de peça não é devolvida automaticamente. Há teste também para uma etapa que registra seu efeito e só depois lança erro, deixando esse efeito visível junto do estado `falhou`.

Não há retentativa automática, deduplicação por missão ou promessa de idempotência. Repetir o mesmo pedido executa novamente as etapas independentes e pode duplicar refeições e consultas, além de encontrar estoque já consumido. O teste de repetição parte de uma única peça: a primeira chamada termina pronta e a segunda parcial. Recuperação, compensação ou repetição só de etapas pendentes exigiriam outro contrato; não estão implícitas em `prepararMissao()`.

A fachada não executa a troca de prisioneiros, não negocia acordos e não garante hospitalidade física ou segurança de visitantes. A solução recebe uma decisão diplomática externa e mantém autorização separada de preparação. O estado `pronta` descreve somente as tarefas deste simulador, sem abrir portas, verificar equipamento real ou comprovar segurança política.

As implementações em memória são colaboradores locais do exemplo e recebem dados tipados; não são validadores de JSON arbitrário nem APIs de produção. Chamadas diretas aos subsistemas permitem também ignorar o protocolo, pois a fachada simplifica acesso e não é uma barreira de autorização.

## Custos, alternativas e comparações

Facade acrescenta um ponto de acoplamento e precisa acompanhar a evolução do protocolo. Simplificar o acesso não garante que uma futura mudança de seu próprio contrato preserve todos os consumidores. Se só uma chamada trivial é necessária, usar a API direta ou uma função pequena é mais claro. Uma função poderia organizar este protocolo; a classe aqui agrupa dependências injetadas e expõe a operação de preparação.

Adapter traduz uma interface para o contrato esperado por outro cliente. Facade oferece uma entrada conveniente para vários serviços sem obrigar esses serviços a conhecer a fachada. Mediator governa regras de comunicação entre colegas que o usam; os subsistemas deste exemplo não se comunicam pela fachada nem dependem dela. Composição ou muitas chamadas, isoladamente, não definem a intenção de um padrão.

Saídas reais e hashes permitem rastrear a execução; não substituem auditoria técnica independente nem aprovação do autor. Não se extrapola o simulador para recursos externos, transações distribuídas ou desempenho não medido.
