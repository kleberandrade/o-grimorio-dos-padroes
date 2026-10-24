# 23 — Interpreter: A Linguagem dos Antigos

A pequena linguagem deste projeto é **uma criação didática nossa**, com F, I e L em sequências e grupos. Terminais registram calor, frio ou luz convencionais num contexto; a expressão não terminal interpreta seus filhos em ordem. O parser constrói a árvore e não recebe contexto. Só depois de analisar toda a entrada e verificar o orçamento, a função de entrada inicia a interpretação.

Não se usa `eval`, `Function`, compilador geral ou serviço externo. Os contadores não são temperatura, energia, engenharia física ou abertura automática de abrigo. Restaurar efeitos do mundo não faz parte deste contrato.

## A alternativa simples primeiro

`src/simples.ts` oferece um `switch` para um único comando conhecido. `src/main.ts` executa essa alternativa antes da composição. Se só existem poucas ordens independentes, sem grupos ou regras compostas, esse despacho é suficiente. Interpreter cobra uma gramática, expressões e manutenção; não é obrigatório fabricar AST para qualquer chamada.

## Executar

Versões declaradas e utilizadas: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. Lock, `.nvmrc`, `.gitignore` e configuração ESM NodeNext estrita são próprios, sem imports de outros projetos.

Na pasta `book-23/code/23-interpreter`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório:

```sh
node book-23/scripts/projetos.mjs 23 install
node book-23/scripts/projetos.mjs 23 check
node book-23/scripts/projetos.mjs 23 run
node book-23/scripts/projetos.mjs 23 solution
node book-23/scripts/projetos.mjs 23 capture
node book-23/scripts/projetos.mjs 23 verify
```

`evidence/stdout.txt` e `solution-stdout.txt` são saídas reais dos programas. `manifest.json` vincula fontes/versões/testes/saídas por SHA256. `runner-commands.json` registra os seis comandos do runner; `isolation.json` registra instalação/testes/programas numa cópia temporária contendo só este projeto e a comparação byte a byte dos stdout. Tempos de teste variam; não houve benchmark. Evidências do produtor não atribuem auditoria independente nem aprovação humana.

## Gramática base original

```text
programa   := sequencia EOF
sequencia  := termo { termo }
termo      := "F" | "I" | "L" | "(" sequencia ")"
```

A justaposição significa execução da esquerda para a direita. Os únicos separadores ignorados são **espaço U+0020, tab U+0009, LF U+000A e CR U+000D**. Eles podem ocorrer entre tokens e nas bordas. VT, FF, espaço não separável, letras minúsculas e demais símbolos não fazem parte da linguagem; não são ignorados.

Texto vazio, texto só de separadores e grupos vazios são inválidos. `L(FI)L` representa L,F,I,L. A base **não admite repetição**; `F*2` é erro no asterisco. Cada programa deve ter até256 unidades UTF16, contando separadores, e no máximo oito grupos simultaneamente aninhados. O nono abre além da profundidade permitida e é recusado. `validarTexto` verifica tamanho antes da análise sintática.

## Análise, AST e interpretação

`analisar(texto): Expressao` usa um parser descendente pequeno, escrito para esta gramática. `Parser` é interno ao módulo; o cliente recebe uma AST de `RunaFogo`, `RunaGelo`, `RunaLuz` e `Sequencia`. Grupos resultam em sequências aninhadas; não há classe adicional de grupo. O parser consome a entrada inteira, inclusive a verificação de fechamento e de símbolos depois de uma composição válida.

`Expressao` oferece `operacoes()` e `interpretar(contexto)`. Cada terminal custa uma aplicação; `Sequencia` guarda os filhos e a soma de seus custos. `test/interpreter.test.ts` também monta uma AST manual para mostrar a composição separadamente do parser.

`executar(expressao, contexto, limite=64)` verifica custo inteiro positivo seguro e limite antes de chamar `interpretar`. O limite configurável só pode reduzir o teto, entre1 e64. `conjurar(texto, ContextoArcano)` faz análise completa, execução prevalidada e depois devolve snapshot do contexto. Uma fonte com65 terminais seguidos de X recebe erro de símbolo em X antes de qualquer decisão de orçamento, pois a análise toda precede a execução.

O teto se refere ao **programa desta chamada**, não à vida inteira de um contexto. `ContextoArcano` acumula aplicações válidas entre chamadas; criar outra instância inicia contadores zerados. O snapshot copia e congela a sequência de símbolos e informa contadores independentes de calor/frio/luz. Não há cálculo termodinâmico de compensação entre F e I.

## Diagnósticos e posições

`ErroPrograma` contém `codigo`, `posicao` e `causa`. A posição é índice **zero-based em unidades UTF16 da string de entrada**, não número de bytes, coluna visual ou contagem de caracteres percebidos. EOF usa `texto.length`. Um emoji pode ocupar duas unidades; `F😀I` acusa símbolo inválido no índice1. A escolha segue a representação de strings usada pelo código JavaScript, não uma promessa de editor Unicode completo. [ECMAScript — String Type](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-string-type).

Códigos da base: `TAMANHO`, `SIMBOLO`, `FECHAMENTO`, `ABERTURA`, `VAZIO`, `PROFUNDIDADE` e `ORCAMENTO`. O exercício também usa `REPETICAO`. Grupo sem fechamento aponta EOF e sua causa informa onde ele abriu. Grupo vazio aponta o fechamento que não tem conteúdo. Fechamento sem grupo aponta o próprio símbolo. Texto longo aponta256, primeira posição fora do tamanho aceito.

**Orçamento usa posição global0**, por convenção: não atribui o total a um símbolo específico. A causa informa custo e limite; é diagnóstico da execução prevista da AST inteira. Erros de configuração ou de construção manual de AST têm exceções próprias de programação e não fingem possuir uma posição em texto que não receberam.

## Falhas sem prefixo e limites dessa garantia

Entrada sintaticamente inválida ou acima dos limites de análise não é interpretada. Custo acima do orçamento também não chama o corpo das expressões. O teste verifica contexto vazio ou estado anterior intacto, incluindo um prefixo L seguido de uma repetição que estouraria o orçamento.

Essa garantia vale para as expressões fornecidas/parser, com custos corretos. **Não é proteção contra extensão hostil** que mente em `operacoes()`, realiza efeitos ao calcular custo ou muda seu comportamento depois de compor uma sequência. Os contratos TypeScript não provam pureza. Chamar `interpretar()` diretamente numa AST também não faz a pré-verificação do wrapper; essa API existe para a colaboração entre expressões, sem barreira de segurança contra o cliente que escolhe ignorar o caminho validado.

Se um contexto ou expressão falhar **depois de começar** a interpretação, a exceção propaga e os efeitos anteriores podem permanecer. O teste com contexto externo mantém F e I antes de uma falha em I e não executa L. Validar toda sintaxe antes de começar não fornece rollback, transação, compensação ou segurança química/física.

## Exercício de repetição

A solução em `solution/` acrescenta `Repeticao` e uma versão ampliada do parser. Não altera a gramática ou os imports da base. `operacoes()` multiplica custo pelo contador sem copiar o corpo várias vezes na AST. O orçamento continua64; aninhamentos de multiplicações grandes podem ser analisados e recusados sem executar suas aplicações previstas. O enunciado detalha gramática, exemplos e fronteiras.

## Dados, custos e quando recusar

Os terminais fornecidos são imutáveis. `Sequencia` copia/congela a lista de referências a filhos, guarda custo calculado e congela a instância; os filhos produzidos pelo parser também são expressões imutáveis fornecidas. Não há clonagem profunda genérica de objetos arbitrários. `Repeticao` mantém uma referência ao corpo, contador e custo, sem expansão. `readonly` orienta o compilador; campos `#` e congelamento protegem somente os dados descritos, sem proteção geral contra código hostil que altere protótipos/dependências.

Análise usa trabalho/armazenamento proporcional ao texto e seus nós, sob256 unidades e profundidade8. A árvore de grupos conserva custos locais; não é uma ferramenta para gramáticas complexas, precedências abertas ou idiomas naturais. A interpretação fornecida realiza até o orçamento de chamadas terminais por execução validada. O contexto mantém um registro acumulado e snapshots copiam sua sequência; ele cresce com novas execuções e não possui histórico limitado ou coleta imediata garantida.

Uma linguagem maior pode pedir uma ferramenta de parsing apropriada e outro contrato de validação/execução, em vez de estender indefinidamente este parser. O parser **constrói** a árvore; Interpreter **avalia** as expressões segundo seu contexto. Não se deve chamar o parser de intérprete completo só por reconhecer símbolos. Command encapsula uma solicitação executável; aqui os objetos representam produções de uma gramática e sua composição. Compartilhar um método de execução não torna as intenções equivalentes.

Tudo é síncrono, sem rede, persistência, recursos externos ou espera de Promise. Métodos de extensão que retornam trabalho assíncrono não recebem garantias deste fluxo. Nenhuma leitura integral de GoF, especificação da linguagem criada ou API externa é inventada como fonte: a gramática é autoral deste projeto; consulta primária limitada à representação de strings está registrada em `referencias.json`.

## Arquivos

`src/limites.ts`: constantes e diagnósticos. `src/expressoes.ts`: terminais, sequência e contexto. `src/parser.ts`: análise base sem contexto. `src/executar.ts`: pré-verificação e entrada completa. `src/simples.ts`: alternativa. `src/main.ts`: programa real. `test/interpreter.test.ts`: AST, ordem, sintaxe, posição, limites e falhas. `solution/`: expressão repetida/parser ampliado/entrada/programa/testes separados. `diagram.mmd`: somente a base.
