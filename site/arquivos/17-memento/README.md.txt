# 17 — Memento: O Guardião da Memória Perdida

Lia pode restaurar o diário a uma captura anterior. Isso substitui o estado atual do diário, inclusive edições posteriores que ela talvez queira preservar. O programa copia uma anotação atual separadamente **antes** de restaurar. Recuperar uma frase não localiza ou resgata uma pessoa e não restaura o mundo.

## A alternativa mais simples

Para um único valor que o mesmo código pode ler, guardar a string anterior numa variável e atribuí-la novamente é suficiente. `src/main.ts` começa executando essa alternativa. Não há razão para esconder o valor em tokens quando não existe uma separação de responsabilidades que justifique isso.

Aqui o problema adicional é permitir que o guardião armazene e selecione capturas sem receber o conteúdo capturado. `Diario` é o **Originator**; os tokens opacos são os **Mementos**; `GuardiaoDasMemorias` é o **Caretaker**. O guardião guarda tokens e rótulos, sem analisar ou restaurar o estado por conta própria. O cliente entrega o token selecionado ao próprio diário, que sabe interpretá-lo.

## Executar

Versões declaradas e utilizadas: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. Há `.nvmrc`, lock próprio e configuração estrita ESM NodeNext; não há importação de outro projeto.

Na pasta `book-23/code/17-memento`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório:

```sh
node book-23/scripts/projetos.mjs 17 install
node book-23/scripts/projetos.mjs 17 check
node book-23/scripts/projetos.mjs 17 run
node book-23/scripts/projetos.mjs 17 solution
node book-23/scripts/projetos.mjs 17 capture
node book-23/scripts/projetos.mjs 17 verify
```

`evidence/manifest.json` vincula fontes, versões, relatório de testes e as duas saídas funcionais por SHA256. `stdout.txt` e `solution-stdout.txt` vêm dos programas reais, sem banners npm. `runner-commands.json` registra os seis comandos do runner. `isolation.json` registra uma cópia temporária contendo somente este projeto, com instalação, testes, programas e comparação byte a byte das duas saídas. Tempos de teste variam; não são um benchmark. Evidências de execução do produtor não atribuem aprovação humana nem auditoria independente.

## Estado, captura e restauração

O estado declarado é `EstadoDiario`: `conteudo` é string; `contexto` contém `local` string e `marcadores`, uma lista de strings. `substituir(estado)` substitui o documento ativo completo. `ler()` devolve uma cópia congelada do estado **ativo**, sem receber token ou revelar uma captura histórica.

Entrada, captura, leitura e restauração copiam explicitamente os campos do modelo, incluindo objeto aninhado e lista. As cópias e suas estruturas declaradas são congeladas. Mutar a entrada original não altera o documento nem a captura. Restaurar, editar novamente e restaurar o **mesmo token** volta ao estado capturado, sem contaminar a memória. Não há cópia profunda genérica de classes, funções, recursos externos ou grafos cíclicos. O contrato de entrada é esse modelo de dados; TypeScript não valida todo objeto arbitrário vindo de JavaScript sem tipos.

`salvar()` cria um objeto vazio, congelado e de protótipo nulo. O token não tem getter, campos ou símbolos que contenham o estado. O nominal `Memoria` ajuda na compilação; a validação real é a presença da **mesma identidade** no `WeakMap` privado `#capturas` daquela instância de diário. O payload fica nesse mapa, não no token. `restaurar(token)` recupera e copia esse payload. Token falso, cópia de campos, resultado de JSON e token de outro diário são recusados com erro, sem alterar o estado ativo.

Esse encapsulamento corrige o getter público de estado da fonte autoral. Não se promete segurança contra código hostil no mesmo processo, alteração de protótipos/dependências, depuração privilegiada ou vazamento da referência ao próprio diário. Quem recebe `Diario` pode usar seu método público de leitura ativa. Tokens também conferem a quem os possui a possibilidade de pedir restauração ao diário correto; opacidade não equivale a autorização de pessoas.

Restaurar substitui todo o estado declarado e perde intencionalmente as edições posteriores no documento ativo. A cópia separada de `main.ts` é uma decisão do cliente anterior à restauração, não um resgate automático de todo trabalho perdido. O token não captura arquivos, papel, pessoas ou sistemas externos. Nenhum efeito externo é desfeito.

## Guardião, índice e limite

`GuardiaoDasMemorias(limite)` exige inteiro seguro positivo. `adicionar(token, rotulo)` guarda uma referência ao token e um rótulo textual não vazio. `listar()` só expõe índices e rótulos; `obter(indice)` entrega o token para seleção. O índice é zero-based, inteiro e dentro da lista atual; negativos, frações, NaN, infinito e posições inexistentes lançam erro. As listagens são novas listas de itens congelados.

Ao exceder o limite, o guardião descarta a entrada mais antiga e os índices restantes são renumerados. Isso não restaura o diário nem revoga tokens que outro código tenha conservado. O guardião não valida o payload ou a origem de tokens: essa verificação pertence ao Originator ao restaurar. Os rótulos não contêm texto do documento automaticamente; quem os escolhe deve evitar colocar neles conteúdo que pretendia manter privado.

## Wrapper e política de checkpoints do exercício

`portaMemorias()` devolve um **objeto separado real**, congelado, com apenas `salvar`, `restaurar` e `correspondeCheckpoint`. Não é o próprio diário convertido para uma interface estreita; métodos `ler` e `substituir` não estão presentes nesse wrapper em execução. As closures mantêm a referência ao diário sem devolvê-la como campo. Isso reduz a API entregue ao caretaker do exercício, sem prometer proteção hostil geral.

`correspondeCheckpoint(token)` verifica igualdade da **marca privada de versão**, não igualdade profunda de conteúdo. `substituir()` cria uma nova marca, mesmo se os valores escritos forem iguais aos anteriores. Restaurar um token recupera sua marca. O booleano permite reconhecer uma edição pendente sem expor texto, local ou marcadores. Token inválido continua sendo erro.

A base demonstra seleção direta de memória: restaurar por escolha do cliente pode perder uma edição não capturada. O exercício `LinhaDoTempo` acrescenta uma política mais restrita, explicada em `exercise/README.md`: captura inicial automática, confirmação explícita depois de editar, recusa de navegar com edição pendente, undo/redo e invalidação da ramificação futura na confirmação de nova edição após undo. Essa política não é uma propriedade automática de Memento.

## Custos e comparação

Cada cópia percorre os campos declarados e a lista de marcadores, além das alocações correspondentes; textos são valores de string, sem promessa de uma cópia física de bytes a cada atribuição. Memórias conservam o payload das versões capturadas enquanto seus tokens forem alcançáveis. O histórico limitado reduz as referências guardadas pelo caretaker, mas não limita referências retidas por outros clientes. `WeakMap` não fornece um prazo exato de coleta de lixo. O descarte com `shift()` pode deslocar entradas, e as listagens copiam metadados.

Estados grandes ou muitas capturas podem tornar esse custo inadequado. Uma operação inversa pequena pode ser mais econômica quando seu contrato é seguro. Command encapsula uma solicitação e pode guardar dados para uma inversa específica; Memento conserva estado para restauração pelo Originator. Restaurar este diário inteiro deliberadamente substitui edições posteriores, enquanto cancelar uma reserva específica pode preservar outras operações. Nenhuma das duas intenções garante reversibilidade física ou transações universais.

Serialização é transformação de dados para outra representação e requer um contrato próprio de formato/versão. Aqui `JSON.stringify(token)` resulta em `{}`; desserializar isso não recria um token válido ou uma captura. Este projeto não exporta snapshots persistentes e não promete que JSON ou `structuredClone` restaurem identidade, métodos, recursos ou encapsulamento.

## Arquivos

`src/diario.ts`: Originator, estado, tokens e wrapper. `src/guardiao.ts`: armazenamento/seleção e validação de índice/limite. `src/main.ts`: alternativa direta, cópia separada e restauração. `test/memento.test.ts`: opacidade em execução, cópias, origem, restauração, limite e wrapper. `diagram.mmd`: somente relações da base. `solution/linha-do-tempo.ts` e testes: política adicional de undo/redo, sem alterar a base para acomodar o exercício.
