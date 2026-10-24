# 12 — Flyweight: Mapa de espíritos compartilhados

`EssenciaEspirito` contém o estado intrínseco tipo/cor e é congelada em execução. `Aparicao` guarda uma referência à essência e sua própria posição extrínseca. `GuildaDosEspiritos` mantém um `Map` privado por tipo validado. Mover uma aparição não altera a posição de outra que usa a mesma essência.

## Executar e verificar

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, lock próprio. Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
npm run benchmark -- 100000 3 5
```

Da raiz Books:

```sh
node book-23/scripts/projetos.mjs 12 install
node book-23/scripts/projetos.mjs 12 check
node book-23/scripts/projetos.mjs 12 capture
node book-23/scripts/projetos.mjs 12 verify
```

O build limpa `dist`, compila ES2022/ESM com TypeScript estrito e executa testes Node sobre JavaScript. Não importa outros capítulos. `exercise/` fica fora da compilação oficial; o programa de solução é compilado e testado separadamente do exemplo-base. O runner confere somente stdout funcional determinístico; não exige que medições de desempenho repitam os mesmos números.

## Fontes e papéis

- `src/espiritos.ts`: Flyweight, Factory, contexto de ocorrência e dados de descrição.
- `src/main.ts`: identidades, deslocamento independente, cache e tipos recusados, sem `Math.random`.
- `test/compartilhamento.test.ts`: identidade, congelamento real, posições, cópias e nomes especiais.
- `experiment/cenario.ts`: dois modelos semanticamente equivalentes e conferência dos dados/identidades.
- `experiment/observacao.ts`: observação de um modelo em processo filho com dados retidos.
- `experiment/medir.ts`: repetições, processos separados, agregação, metadados e preservação dos resultados.
- `solution/`: conferência funcional de cardinalidade e testes da equivalência dos modelos.
- `exercise/README.md`: protocolo de medição e interpretação dos resultados.
- `diagram.mmd`: fonte lógica editável; renderização e QA visual na etapa própria.
- `evidence/`: stdout funcional, testes, manifesto e isolamento. Medições ficam em `evidence/experimentos/` com capturas datadas próprias.

## Intrínseco, extrínseco e cache

Os tipos são `fogo`, `gelo` e `vento`, com cores `vermelho`, `azul` e `branco`. A fábrica valida o nome antes de consultar o `Map`. `constructor`, `__proto__`, `toString` e desconhecidos são recusados sem criar uma essência. O Map não consulta propriedades herdadas de um objeto literal. A quantidade de essências é por instância da fábrica, não uma unicidade global.

As duas propriedades intrínsecas são strings e a própria essência passa por `Object.freeze`. O teste tenta alterá-las em execução; `readonly` TypeScript não é a única proteção. Uma essência mutável estruturalmente compatível é recusada pelo contexto. A essência não guarda posição e a recebe quando produz uma descrição.

`Aparicao` copia as coordenadas na construção e em `moverPara()`. O deslocamento substitui apenas sua posição, preservando a essência compartilhada. A descrição é um valor congelado novo, sem expor a posição interna. Coordenadas precisam ser finitas; são dados de mapa local, sem escala física, rota marítima ou garantia de segurança. As APIs são tipadas e não validam JSON arbitrário ou manipulações externas de protótipos.

A tabela é parte da gestão de compartilhamento. Cache pode guardar qualquer resultado para evitar recalculá-lo; isso sozinho não separa estado intrínseco e extrínseco. Aqui o Flyweight é a essência imutável que várias ocorrências usam simultaneamente. Pool normalmente empresta e recebe de volta objetos para reutilizar seu ciclo de vida; a fábrica deste projeto não reserva exclusividade, não empresta aparições nem recebe objetos devolvidos.

## Experimento real separado

`npm run benchmark -- [contagem] [cardinalidade] [repeticoes]` gera observações novas. A contagem suportada pelo instrumento é de 1 a 1000000, cardinalidade de 1 a 3 e repetições de 1 a 20. Os limites são do instrumento didático, não capacidade máxima certificada do padrão. O padrão de execução usa 100000 aparições, três tipos e cinco repetições de cada modelo.

Cada observação usa **processo filho próprio**, as mesmas classes, os mesmos tipos/cores e posições determinísticas. Só difere criar uma essência por aparição ou consultar a fábrica. Não há payload sintético inflado, Buffer ou ArrayBuffer de aplicação; strings iguais podem ser internadas. O cenário e a tabela quando usada permanecem vivos por referência global no processo filho durante a leitura final.

Memória registra `process.memoryUsage()` antes/depois e deltas em **bytes**: `rss`, `heapTotal`, `heapUsed`, `external`, `arrayBuffers`. RSS descreve o processo; as categorias V8 não representam toda a memória. `arrayBuffers` já faz parte de `external`; elas não devem ser somadas como parcelas independentes. Mesmo sem buffers de aplicação, o runtime pode registrar memória externa. Deltas negativos ou variações do alocador não são ocultados.

O instrumento usa `--expose-gc`, verificado no runtime fixado, e exige que `global.gc` esteja disponível. Solicita uma coleta antes do baseline e uma depois da construção, fora do intervalo de tempo. Isso não garante uma coleta completa, um heap mínimo, liberação imediata ao sistema operacional ou medição byte-exata reproduzível. Flags V8 não têm estabilidade garantida; esta execução é sustentada pelo Node efetivamente observado.

Tempo usa `performance.now()` em **milissegundos**, do início ao fim de `construirCenario()`. Inclui validação de parâmetros, criação da tabela quando usada, consultas, instâncias, posições e congelamento. Exclui inicialização do processo, aquecimento, GC, leituras de memória e a conferência por hash/identidades. Mede tempo decorrido, não CPU exclusiva. A comparação semântica acontece depois da leitura de memória e não infla o conjunto medido.

O JSON preserva cada baseline, leitura final, delta, tempo, versões, flags, plataforma, CPU, parâmetros e ordem das observações. Agrega mínimo, mediana e máximo por modelo. A ordem alterna entre repetições para reduzir um viés simples de sequência; outras cargas do sistema, JIT e GC não são totalmente controlados. Não há limiar mínimo de economia ou velocidade em teste algum. Qualquer resultado pertence àquela carga e execução; pode ser inconclusivo. O instrumento não afirma ganho universal.

## Custo e alternativa

O compartilhamento custa tabela, consulta, validação, referências e uma política de ciclo de vida. Na implementação atual existem no máximo três essências por fábrica; uma aplicação com cardinalidade crescente precisaria de outra política de gestão e medição. Flyweight pode não se justificar com poucas ocorrências, pouca repetição ou intrínseco pequeno.

A alternativa sem compartilhar é uma implementação real do experimento: cada `Aparicao` recebe uma nova `EssenciaEspirito` com os mesmos dados. O hash prova equivalência dos valores usados, sem comparar identidade, que é justamente a diferença estudada. A estrutura não elimina o custo de cada ocorrência ou posição. Não se promete uma alma humana compartilhada, uma economia física de cristais ou efeito no mar.

## Fontes primárias e limites da evidência

Consultas de 22/10/2026: [Node — process.memoryUsage](https://nodejs.org/api/process.html#processmemoryusage), [Node — performance.now](https://nodejs.org/api/perf_hooks.html#performancenow) e [Node — opções V8](https://nodejs.org/api/cli.html#useful-v8-options). Documentação corrente observada em **26.12.1**, enquanto a implementação/flag/medições são verificadas em **26.10.0**; não se assume equivalência integral das versões.

Hashes e testes vinculam código, saídas e observações, sem constituir auditoria técnica independente ou aprovação do autor. Medições variáveis não são copiadas para o stdout funcional nem comparadas byte a byte em nova execução.
