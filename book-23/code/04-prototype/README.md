# 04 — Prototype: Clonagem de poções compostas

Uma configuração existente de poção é clonada e então personalizada. `Pocao.clone(novoLote)` cria outro objeto real de `Pocao`, copiando sua fórmula atual. O cliente `personalizarLote()` chama esse método antes de alterar uma dose; não recria a variante do zero fingindo clonagem.

## Executar

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, com lock independente. Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books, o runner seleciona apenas este projeto:

```sh
node book-23/scripts/projetos.mjs 04 install
node book-23/scripts/projetos.mjs 04 check
node book-23/scripts/projetos.mjs 04 capture
node book-23/scripts/projetos.mjs 04 verify
```

Compilação local estrita com `tsc`, ES2022/ESM; testes Node sobre a saída JavaScript. O build limpa `dist`, não importa capítulos vizinhos e exclui `exercise/` para separar tentativa e solução.

## Arquivos e papéis

- `src/contratos.ts`: Prototype, ingrediente e dados aninhados.
- `src/pocao.ts`: Concrete Prototype, identidade do lote e comportamento preservado pelo clone.
- `src/selo.ts`: procedência imutável compartilhada de propósito.
- `src/validacao.ts`: cópia explícita dos ingredientes e invariantes.
- `src/cliente.ts`: personalização que depende só do contrato do protótipo.
- `src/main.ts`: original, clone personalizado e observação do compartilhamento.
- `test/clonagem.test.ts`: isolamento bidirecional, entradas/consultas, selo, limites e alternativas.
- `exercise/` e `solution/`: novo componente mutável com clonagem de subtipo testada.
- `diagram.mmd`: fonte lógica editável; renderização e inspeção visual pertencem à etapa de arte.
- `evidence/`: stdout real, testes e manifesto; `isolation.json` registra cópia executada sem o repositório.

## Contrato de cópia e identidade

Cada poção guarda uma lista privada de ingredientes. Cada ingrediente tem nome, objeto `dose` (quantidade e unidade) e uma lista de observações. O construtor e `adicionarIngrediente()` copiam a entrada em todos esses níveis. `clone()` passa os dados atuais ao construtor de `Pocao`, que os copia; não há ligação mutável entre as fórmulas. `consultarIngredientes()` também devolve cópias defensivas. Mudar o resultado de uma consulta não edita a poção; para isso use seus métodos.

O objeto do clone tem identidade distinta. O cliente fornece seu novo lote, não vazio e diferente do lote original após remover espaços externos. Essa regra não cria um registro global de lotes: duas chamadas independentes podem escolher o mesmo identificador. Não há geração de UUID ou persistência oculta.

O mesmo `SeloDeProcedencia` é mantido por referência. Ele contém apenas duas strings e é congelado com `Object.freeze` em seu construtor; a poção também recusa um selo mutável estruturalmente compatível. Os testes provam identidade compartilhada, rejeição de mutação e essa recusa. O selo registra procedência no modelo, sem assinatura digital, autenticidade ou rastreabilidade externa. Lote e selo da poção são acessados por getters sem setters; os campos de estado usam `#` em execução.

As quantidades devem ser positivas e finitas. Nomes de ingrediente são normalizados e não podem se repetir dentro da mesma fórmula. Alterar ingrediente desconhecido ou adicionar nota vazia gera erro. São invariantes de configuração, sem validar efeitos químicos, doses reais, eficácia agrícola ou segurança de uso. A poção modela dados, não matéria ou seres vivos.

## Fronteiras da cópia

A cópia é profunda **para este modelo acíclico de strings, números, listas e objetos declarados**. Não é um algoritmo genérico de clonagem: não percorre ciclos, não preserva qualquer grafo de referências e não copia funções, conexões, arquivos ou recursos externos. Acrescentar estado mutável requer decidir se deve copiar, compartilhar ou recusar e testar essa política. Subclasses precisam preservar seu estado em `clone()`; a solução faz isso explicitamente.

O teste de construção direta demonstra uma alternativa real quando todos os valores já são conhecidos: `new Pocao(...)` produz os mesmos valores da variante, com suas próprias cópias de dados. Isso não é chamado de clone. Prototype é útil quando a configuração atual do objeto é a fonte que deve ser reutilizada, com uma política de cópia controlada. Pode custar mais clareza que a construção direta se a semântica da cópia for difícil.

`structuredClone()` é executado no teste com dados simples e também com esta instância. Os dados de ingredientes são copiáveis; a instância de `Pocao`, que guarda seu estado em campos privados, resulta em um objeto comum vazio no runtime fixado, sem métodos da classe. Essa observação específica não estabelece equivalência com `clone()`, nem uma regra de que toda classe sempre tenha o mesmo resultado. O projeto não usa serialização JSON como substituto e não faz benchmarks ou alegações de desempenho.

Factory Method varia a criação de um produto num ponto de extensão. Prototype parte de um objeto existente e de sua política de cópia. Não é necessário combiná-los neste exemplo.

## Referência e conferência

[Node.js — structuredClone](https://nodejs.org/api/globals.html#structuredclonevalue-options), consultado em 22/10/2026, documenta a função global. A comparação da instância concreta é sustentada pelo teste executado em Node 26.10.0, não por uma promessa de preservação genérica de classes. Código, diagrama e stdout devem acompanhar as mesmas fontes auditadas; captura e testes não são auditoria técnica independente nem aprovação do autor.
