# 21 — Iterator: O Viajante das Coleções

Suri e Neri precisam percorrer o mesmo lote sem mover a posição um do outro. `ArquivoEmLista` armazena ordens num array; `ArquivoEncadeado` usa nós com próximo e referências de início/fim. Ambos oferecem `criarPercurso()` e ocultam esses armazenamentos do cliente. O percurso percorre registros locais; não confirma onde uma família está nem realiza resgate.

## A solução nativa primeiro

Se um array já atende ao contrato, `for...of` nativo pode bastar. `src/nativo.ts` executa um exemplo mínimo real: instrumenta o `Symbol.iterator` de um array e compara `forEach`, `map` e `for...of`. Os dois primeiros usam callbacks sobre os elementos do array; `map` produz outro array. O `for...of` usa o protocolo de iteração. No exemplo, o contador permanece zero após `forEach`/`map` e chega a um após `for...of`. Esses métodos de callback não são, por si, o protocolo Iterator. [Algoritmos de arrays](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.foreach), [for...of](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-for-in-and-for-of-statements).

O benefício adicional deste projeto é um contrato comum para **duas representações reais**, com snapshot no instante definido e posição independente. Não é recomendação de envolver todo array numa classe. Quando o comportamento nativo já resolve, a classe extra acrescenta custo sem benefício necessário.

## Executar

Versões declaradas e utilizadas: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. Lock, `.nvmrc`, `.gitignore` e configuração ESM NodeNext estrita são próprios; nenhum outro projeto é importado.

Na pasta `book-23/code/21-iterator`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório:

```sh
node book-23/scripts/projetos.mjs 21 install
node book-23/scripts/projetos.mjs 21 check
node book-23/scripts/projetos.mjs 21 run
node book-23/scripts/projetos.mjs 21 solution
node book-23/scripts/projetos.mjs 21 capture
node book-23/scripts/projetos.mjs 21 verify
```

`evidence/manifest.json` vincula versões/fontes/testes/stdout por SHA256. `stdout.txt` e `solution-stdout.txt` vêm dos programas reais. `runner-commands.json` registra os seis comandos do runner; `isolation.json` registra instalação/testes/programas numa cópia temporária só deste projeto e comparação byte a byte das duas saídas. Tempos de teste variam; não houve benchmark. Evidências do produtor não são auditoria independente ou aprovação humana.

## Contrato local da base

`Ordem` contém `id` inteiro positivo seguro e `descricao` string não vazia. `adicionar()` copia/normaliza/congela esses campos e recusa id duplicado naquele arquivo. `atualizar()` exige id existente, substitui a descrição e **mantém a posição de inserção**. Id não representa ordem cronológica nem critério de classificação: inserir2 e depois1 produz2,1. Descrição não localiza pessoa ou prova entrega de ordem.

`ArquivoOrdens` expõe apenas `criarPercurso(): IteradorOrdens`. O cliente consumidor não precisa de acesso aos nós ou ao array. As classes concretas também oferecem as operações de edição à composição que as possui.

Cada chamada de `criarPercurso()` captura imediatamente um snapshot por valor dos campos declarados e cria um `PercursoSnapshot` com índice próprio. O método `proximo()` devolve `PassoLocal`: `{ fim: false, ordem }` enquanto há item, e `{ fim: true }` quando acaba. Vazio já começa em fim; chamadas posteriores permanecem fim. Não há reset ou retorno ao início da mesma instância. Criar outro percurso é outra operação, com outro índice e um novo snapshot.

Uma adição ou atualização após a criação do percurso não altera suas ordens, **mesmo antes do primeiro passo**. Um novo percurso vê o estado novo. Essa política evita que a referência ao array mutável da fonte autoral faça o cursor antigo observar inserções posteriores. Dois percursos criados antes de uma edição veem o mesmo lote e avançam independentemente.

O contrato local tem intenção de Iterator GoF, mas não é o protocolo JavaScript: usa `proximo`/`fim`/`ordem` e não fornece `[Symbol.iterator]` na base. Os testes verificam essa ausência. Não se deve passar a coleção base diretamente a `for...of` fingindo que a ponte já existe.

## Ponte e gerador no exercício

No protocolo nativo, `Iterable` fornece `[Symbol.iterator]()` e o iterador devolve objetos com `done`/`value` em `next()`. `solution/iteravel.ts` implementa essa ponte explicitamente em `ArquivoIterable`. Cada chamada a seu `[Symbol.iterator]()` cria o percurso/snapshot naquele instante; **construir o wrapper não captura**. O objeto iterador retornado é também iterável, devolvendo a si mesmo. [Interfaces de iteração](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-common-iteration-interfaces).

`gerarSnapshot(origem)` é uma fábrica normal: captura o percurso primeiro e depois devolve uma `function*`. O corpo do gerador só avança quando retomado; por isso a captura não fica dentro dele. Testamos a edição entre criação e primeiro `next()`. [GeneratorStart/GeneratorResume](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-generatorstart).

A ponte implementa `return()` terminal. `break` no `for...of` desse iterador o encerra; tentar percorrer **a mesma instância** novamente não a reinicia. O gerador também fica fechado depois de `break`/`return`. Chamar outra vez `[Symbol.iterator]()` no wrapper, ou criar outro gerador pela fábrica, é que produz novo percurso. Não há promessa de retomada de gerador encerrado ou cursor remoto.

## Cópias, limites e custos

As ordens possuem apenas número e string; são copiadas/congeladas na entrada e na captura. A lista interna do snapshot e os resultados `PassoLocal` são congelados. O índice privado muda a cada passo. As cópias não são uma clonagem profunda genérica de classes, recursos ou campos arbitrários. Nós da lista encadeada não são expostos; atualizar um deles substitui sua ordem sem tocar no snapshot antigo.

Na ponte, os objetos `IteratorResult` são congelados pelo código do exercício. Os objetos de resultado criados pelo **gerador nativo não recebem `Object.freeze`** deste projeto; as ordens que ele entrega continuam congeladas. `readonly`/interfaces são verificações estáticas, enquanto campos `#` protegem representação e posição em execução; isso não promete segurança contra código hostil que altere protótipos ou dependências.

Criar um percurso copia N registros e ocupa memória proporcional a N, mesmo que só se leia o primeiro. A implementação encadeada primeiro reúne referências num array temporário e depois constrói a cópia do snapshot; não é um cursor de memória constante. Cada iterador retém seu snapshot enquanto permanecer alcançável, inclusive depois do fim na implementação local. Não há garantia de descarte imediato no `return()` da ponte ou de prazo de coleta de lixo.

Buscar id para duplicata/atualização percorre o armazenamento na implementação fornecida; adicionar não é apresentado como ganho de desempenho da lista encadeada. O passo do `PercursoSnapshot` consulta uma posição e cria um pequeno resultado, sem revisitar a coleção original. Muitos snapshots simultâneos custam memória; uma visão ao vivo ou percurso nativo simples pode ser mais apropriado se seu contrato for suficiente. Não houve medição de velocidade ou memória.

Tudo é síncrono, local e finito conforme o conteúdo armazenado. Não há paginação, acesso remoto, conexão de banco, falha de rede, cancelamento assíncrono ou controle de concorrência distribuída. APIs remotas e cursores de banco exigem contratos próprios; a semelhança do nome iterator não transfere essas garantias.

Iterator oferece percurso; Visitor organiza operações sobre tipos que aceitam visitas, normalmente usando um percurso para alcançá-los. Não são substitutos automáticos. Uma coleção nativamente iterável e um gerador podem cumprir o percurso sem uma classe manual, desde que a política de captura e encerramento seja a desejada.

## Fontes efetivamente consultadas

Consulta em **23/10/2026**, TC39 ECMAScript, documento vivo então rotulado **ECMAScript2027**. Essa referência não certifica que toda a edição esteja implementada no Node26.10.0. Somente as operações demonstradas foram executadas nesse runtime. URLs, seções e vínculos com os testes estão registrados em `referencias.json`; não há framework externo ou API suposta.

## Arquivos

`src/contratos.ts`: dados/contrato local. `src/arquivos.ts`: array e nós encadeados. `src/percurso.ts`: snapshot e posição externa. `src/nativo.ts`: comparação nativa executável. `src/main.ts`: exemplo real. `test/iterator.test.ts`: contratos comuns às duas representações. `solution/iteravel.ts`: ponte/gerador adicionais; programa/testes separados. `diagram.mmd`: apenas a base, sem atribuir `Symbol.iterator` às coleções originais.
