# 15 — Template Method: O Ritual das Etapas Sagradas

O projeto representa lotes de poções de fogo e gelo por dados locais. A sequência é preparar ingredientes, conjurar o encantamento e selar. O resultado informa o que foi concluído e o estado do lote; uma falha interrompe o fluxo sem fabricar uma selagem. Este recorte não simula contaminação, pessoas, travessia ou proteção química.

## Começar pela solução simples

`src/funcao.ts` oferece `realizarComCallback(ingredientes, conjurar)`: uma função mantém a sequência e recebe a variação como callback. Ela é suficiente quando há um fluxo curto e uma única variação. Os testes comparam seus dados e falhas com os das variantes em classes. A presença de um callback, por si só, não exige construir uma hierarquia ou nomear outro padrão.

Em `src/ritual.ts`, `Ritual.realizar()` concentra o mesmo esqueleto numa classe base. `prepararIngredientes()` e `selar()` têm implementações comuns; `conjurarEncantamento()` é abstrato. `RitualFogo` e `RitualGelo` implementam o passo variável. O cliente chama o mesmo método, e o template chama os passos por despacho da subclasse. Esta é a implementação de Template Method do projeto.

## Executar

Versões declaradas e efetivamente usadas: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. `.nvmrc`, `package.json` e lock próprio registram o ambiente. O TypeScript é local, ESM NodeNext, estrito; não há importação de outros projetos.

Dentro de `book-23/code/15-template-method`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório, com o mesmo Node:

```sh
node book-23/scripts/projetos.mjs 15 install
node book-23/scripts/projetos.mjs 15 check
node book-23/scripts/projetos.mjs 15 run
node book-23/scripts/projetos.mjs 15 solution
node book-23/scripts/projetos.mjs 15 capture
node book-23/scripts/projetos.mjs 15 verify
```

A captura guarda `evidence/stdout.txt`, `solution-stdout.txt`, `tests.txt` e `manifest.json`, com hashes e versões. `verify` repete testes e compara saídas funcionais byte a byte; os tempos dos testes variam. `evidence/isolation.json` registra instalação e execução numa cópia temporária contendo somente este projeto. São evidências de execução, não parecer independente ou aprovação humana.

## Contrato e estado observável

`realizar(ingredientes: readonly string[]): ResultadoRitual` é síncrono. Uma execução possui dados locais próprios; repetir a chamada não reutiliza o lote anterior.

1. Preparar exige pelo menos um ingrediente e nomes não vazios. A base copia e normaliza os nomes, sem quantidade, dosagem ou regra química.
2. Conjurar recebe a lista preparada e devolve `Encantamento`. Fogo produz `elemento: "fogo"` e `efeito: "aquecimento modelado"`; gelo produz `"gelo"` e `"resfriamento modelado"`.
3. Selar devolve a marca `"selo de fogo"` ou `"selo de gelo"`, conforme o encantamento. Essa string representa uma selagem modelada e não certifica um objeto físico.

O resultado discriminado tem `status: "concluido"` ou `"falhou"`, `etapasConcluidas` e `lote`. O lote contém `ingredientesPreparados`, `encantamento` e `selo`. Cada campo é `null` enquanto seu passo ainda não foi concluído. Em falha, o resultado também informa `etapaFalha` e `motivo`; a etapa que lançou erro não entra em `etapasConcluidas` e as seguintes não são chamadas. Se a conjuração falhar, os ingredientes permanecem preparados e encantamento/selo ficam nulos. Se a selagem falhar, o encantamento permanece e o selo fica nulo.

Erros síncronos das etapas são convertidos em resultado de falha: preserva-se a mensagem de `Error`; valores lançados que não sejam `Error` recebem a mensagem explícita definida em `mensagem()`. A exceção original não é relançada nem preservada como identidade no resultado. Não há retentativa automática, transação ou rollback. Se uma extensão produz efeitos externos antes de falhar, esses efeitos podem permanecer; os testes mostram que chamadas já feitas não são apagadas. Uma falha da execução anterior não contamina os dados locais de uma nova chamada. Isso não prova idempotência de extensões com efeitos externos.

## Extensão, limites e custos

A sequência descrita vale para a base e as subclasses fornecidas, usadas sem adulteração. **TypeScript não tem `final`: `public realizar` pode ser sobrescrito.** Também é possível sobrescrever passos concretos protegidos; uma extensão que pule etapas ou minta sobre seus resultados viola este contrato. A hierarquia organiza a cooperação, sem impedir toda extensão incorreta.

`protected`, `abstract`, `override` e `readonly` são recursos de verificação estática, sem constituir barreiras de segurança em execução. O programa aplica `Object.freeze` aos resultados, às listas, ao lote e ao encantamento copiados. Esses objetos possuem apenas os campos escalares e listas declarados; o congelamento e as cópias cobrem esse modelo. Não há promessa de cópia profunda genérica, de congelamento de protótipos, de imutabilidade dos objetos de ritual ou de controle de código arbitrário. A entrada é copiada pelas implementações fornecidas; callbacks e subclasses externos continuam responsáveis por seus próprios efeitos.

Herança acopla subclasses aos nomes, argumentos, retorno e ordem dos passos da base. Uma mudança de contrato pode exigir rever todas elas. O exemplo repete a sequência na alternativa funcional para permitir comparação; isso não é recomendação de manter dois fluxos duplicados numa aplicação. Preparação e snapshots copiam listas, com custo proporcional ao número de ingredientes; cada resultado tem seus próprios dados. Não houve benchmark ou promessa de ganho de desempenho.

Strategy costuma variar uma política ou algoritmo por composição. Template Method fixa o esqueleto nesta base e varia passos por herança. Uma função que recebe a conjuração, ou um objeto de estratégia recebido pelo fluxo, evita esse acoplamento de subclasses quando tal composição é mais clara. Essa comparação não transforma todo workflow em um framework universal, nem estabelece que uma dessas alternativas seja sempre superior.

A frase da fonte autoral sobre um ritual que “jamais falhava” não é garantia deste projeto: erros são parte explícita do contrato e dos testes. Nenhuma API de framework externo é necessária ou apresentada aqui.

## Arquivos e exercício

`src/contratos.ts` define os dados e operações pequenas comuns; `src/ritual.ts` contém a hierarquia; `src/funcao.ts` contém a alternativa; `src/main.ts` demonstra dois sucessos e uma falha; `test/ritual.test.ts` verifica ordem, parcial, dados e isolamento. `diagram.mmd` representa somente a implementação base.

O exercício em `exercise/README.md` instala um hook opcional **ausente da base original**. A versão alterada da base está em `solution/ritual-com-hook.ts`, sem modificar a base principal. A resposta comenta as alterações no método template, tipos de etapas e subclasses, e demonstra aprovação, recusa e hook padrão vazio.
