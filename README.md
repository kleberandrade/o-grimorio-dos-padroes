# O Grimório dos Padrões

Design Patterns em 23 histórias, por Kleber de Oliveira Andrade.

Material complementar: 23 projetos independentes em TypeScript, com fontes, testes, exercícios, soluções e evidências de reprodução. A landing page está em `site/` e disponibiliza leitura de código e downloads sem login.

## Comece por um projeto

Ambiente de reprodução: **Node 26.10.0**, **npm 11.19.1**, **TypeScript 5.9.3**, **@types/node 26.0.0**. São as versões fixadas nos exemplos; o compilador é instalado localmente pelo lock.

```sh
git clone https://github.com/kleberandrade/o-grimorio-dos-padroes.git
cd o-grimorio-dos-padroes/book-23/code/01-factory-method
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Cada projeto tem seu próprio lock e configuração. Não existe um projeto npm único que reúna os capítulos. Leia o README escolhido e tente o exercício antes de consultar `solution/`. Os testes oficiais incluem a solução fornecida; eles não avaliam automaticamente uma tentativa guardada fora do build.

Consulte o [guia completo](GUIA-DOS-PROJETOS.md) para os 23 exemplos, o experimento opcional de Flyweight e o runner que preserva os comandos impressos no livro:

```sh
# Na raiz deste repositório
node book-23/scripts/projetos.mjs 01 install
node book-23/scripts/projetos.mjs 01 check
node book-23/scripts/projetos.mjs 01 run
node book-23/scripts/projetos.mjs 01 solution
node book-23/scripts/projetos.mjs 01 verify
```

## Catálogo

- [Criacionais: 01 a 05](book-23/code/): Factory Method, Abstract Factory, Builder, Prototype, Singleton.
- [Estruturais: 06 a 12](book-23/code/): Adapter, Facade, Decorator, Proxy, Composite, Bridge, Flyweight.
- [Comportamentais: 13 a 23](book-23/code/): Strategy, State, Template Method, Command, Memento, Observer, Mediator, Chain of Responsibility, Iterator, Visitor, Interpreter.

## Reproduzir a página localmente

Sem dependências de build ou bibliotecas externas. Execute, na raiz do repositório:

```sh
python3 -m http.server 4173 --directory site
```

Abra http://localhost:4173. Os arquivos em `site/arquivos/` são cópias das fontes dos projetos; os ZIPs ficam em `site/downloads/`. O arquivo `FONTES-SHA256.json` permite conferir os 543 arquivos da edição. A configuração Vercel publica somente `site/`.

Os registros da edição totalizam 354 testes aprovados. Essa contagem corresponde às execuções editoriais registradas nas evidências dos projetos, não a uma nova execução disparada ao acessar a página. A landing oferece consulta e download; a execução dos projetos acontece localmente.

© Kleber de Oliveira Andrade. Acesso público não acrescenta uma licença de uso ao material. O manuscrito integral, PDFs e EPUBs não fazem parte deste repositório.
