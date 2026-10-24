# 03 — Builder: Construtor de personagens e equipamentos

O produto é uma **ficha de configuração de um participante de resgate**, com nome, classe, vida, missão e equipamento. O programa não cria uma pessoa. Duas receitas constroem perfis de torre e galeria. O mesmo contrato de etapas produz uma ficha estruturada (`PersonagemBuilder`) ou um relatório textual (`RelatorioBuilder`).

## Executar

Versões de reprodução: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, dependências fixadas no lock. Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books:

```sh
node book-23/scripts/projetos.mjs 03 install
node book-23/scripts/projetos.mjs 03 check
node book-23/scripts/projetos.mjs 03 capture
node book-23/scripts/projetos.mjs 03 verify
```

Compilação estrita para ES2022/ESM com `tsc` local; testes Node sobre JavaScript emitido. Cada build limpa `dist`. Nenhum projeto vizinho é importado. `exercise/` fica separado da solução e fora da compilação oficial.

## Papéis e fontes

- `src/contratos.ts`: produto, equipamento, missão e interface Builder `EtapasDeExpedicao`.
- `src/builders.ts`: builders concretos com retornos próprios; base interna compartilha rascunho e etapas.
- `src/validacao.ts`: invariantes e cópia do produto, sem entrega de alias mutável.
- `src/diretor.ts`: Director opcional e duas receitas independentes da representação.
- `src/direto.ts`: alternativa executável com objeto de opções, sem Builder.
- `src/main.ts`: duas fichas, preservação da primeira, relatório e recusa de ficha incompleta.
- `test/`: contratos de construção, reuso, entradas mutáveis, imutabilidade e alternativa direta.
- `exercise/` e `solution/`: proteção especial e comparação com objeto de opções.
- `diagram.mmd`: relações editáveis do código-base; renderização e QA visual ficam na etapa própria.
- `evidence/`: stdout real, testes e manifesto SHA-256; `isolation.json` registra execução numa cópia sem o livro.

## Construção e política de reuso

Os builders aceitam etapas em chamadas separadas. Seus métodos retornam `this` para permitir encadeamento, mas o contrato visto pelo Director não depende disso. `build()` pertence ao builder concreto, com retorno `FichaDePersonagem` ou `string`; o Director só coordena etapas. Assim o exemplo demonstra construção por etapas com representações distintas, além de uma API fluent com setters.

`build()` valida e **retém o rascunho**. Cada chamada bem-sucedida devolve um novo snapshot; uma falha permite corrigir o rascunho e tentar novamente. `reiniciar()` descarta o rascunho explicitamente. Cada receita do Director chama `reiniciar()` antes das outras etapas, evitando a herança acidental de equipamentos. Sem Director, o chamador escolhe quando reiniciar.

Nome e classe são obrigatórios e normalizados com `trim`. Vida é um número positivo finito; não modela saúde real. Missão é `torre` ou `galeria`. Torre exige ao menos um item com proteção `vento`, galeria exige `agua`; todos os equipamentos precisam de nome não vazio. A validação ocorre ao construir o resultado, não a cada etapa: um rascunho parcial é permitido e não é um produto válido.

O equipamento é copiado na entrada, incluindo sua lista de proteções. No resultado há novas cópias da lista de equipamentos, de cada objeto e de suas listas aninhadas; esses níveis e a ficha são congelados em execução com `Object.freeze`. É uma cópia profunda **destes dados declarados**, sem função genérica de clonagem de objetos, recursos externos ou ciclos. O relatório é string imutável. A base usa `#dados` para não expor o rascunho mutável.

## Limites e alternativas

Ficha válida significa que as invariantes do modelo foram atendidas. Não certifica sobrevivência, treinamento, qualidade de cordas, adequação física nem disponibilidade de estoque. As etiquetas de proteção são convenções locais. As funções recebem entradas tipadas; não são um parser ou validador de JSON arbitrário, e `readonly` sozinho não congela objetos.

Não há persistência, rede, consumo de equipamentos ou custo de expedição simulado. O produto não inclui mana, montaria ou habilidades sem função no problema. Dados completos podem ser passados diretamente a `criarFichaDireta()`, usando a mesma validação e cópia. Isso costuma ser mais simples quando não há etapas distribuídas, receitas reutilizadas ou representações distintas.

Builder custa classes adicionais, rascunho e regras explícitas de finalização. Abstract Factory escolhe uma família de produtos prontos e relacionados; Builder coordena a construção de um resultado por etapas. Não é necessário usar ambos para configurar esta ficha.

As saídas vêm da execução real e a captura não substitui auditoria técnica independente nem aprovação autoral. Uma alteração de código invalida hashes anteriores e exige nova execução e conferência dos trechos publicados.
