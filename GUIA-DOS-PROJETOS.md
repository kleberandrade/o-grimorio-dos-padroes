# Guia prático dos projetos


Escolha um exemplo e execute seu diretório completo. Cada projeto possui dependências, configuração, fontes, testes e solução próprios. Você pode estudá-los separadamente: não há um projeto npm único que reúna os capítulos, nem é preciso instalar todos para começar.

Os trechos impressos orientam a leitura de decisões específicas. Alguns mostram um arquivo inteiro; outros, somente uma parte. Não os concatene para montar o programa: imports, testes e definições auxiliares estão nos arquivos do projeto. Classes com o mesmo nome em exemplos diferentes pertencem a programas diferentes.

## Prepare o ambiente

O ambiente de reprodução é Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3** e `@types/node` **26.0.0**. São as versões fixadas para estes exemplos. TypeScript e os tipos Node são dependências locais instaladas pelo lock de cada diretório; não é necessário um compilador TypeScript global.

Antes de instalar as dependências, confira no terminal:

```sh
node --version
npm --version
```

As respostas esperadas são `v26.10.0` e `11.19.1`. Selecione essas versões no gerenciador de runtimes que você utiliza. Se já usa nvm, pode executar `nvm install` e `nvm use` dentro do projeto, que contém `.nvmrc`. Confira também a versão npm: a escolha do Node não dispensa essa conferência.

Mantenha `package.json`, `package-lock.json`, `tsconfig.json` e `.nvmrc` junto das fontes ao copiar o exemplo. Cada lock pertence ao seu projeto. Não o substitua pelo de outro capítulo nem por dependências de um projeto comum.

## Instale e execute um único exemplo

Os caminhos deste guia usam a estrutura do repositório. Para começar por Factory Method, entre em:

```sh
cd book-23/code/01-factory-method
```

Se você copiou somente esse diretório para outro local, entre na sua cópia de `01-factory-method` e execute os mesmos comandos internos:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

`npm ci` instala as dependências a partir do lock e pode precisar acessar o registro npm. `npm test` recompila e executa os testes da base e da solução fornecida. `npm start` recompila e executa a demonstração principal; `npm run solution` faz o mesmo com a demonstração da resposta ao exercício. Você pode deixar este último comando para depois da sua tentativa.

Os scripts limpam e recriam `dist/`. Edite os arquivos TypeScript nas pastas de fontes, não o JavaScript gerado ali. A execução usa o compilador local e o JavaScript emitido: rodar um trecho TypeScript diretamente com Node não é o procedimento de reprodução destes projetos.

Depois da instalação, você pode conferir o compilador local sem baixar outra versão:

```sh
node node_modules/typescript/bin/tsc --version
```

A resposta esperada é `Version 5.9.3`.

## Encontre a base, o exercício e a resposta

Comece pelo `README.md` do diretório escolhido. Ele apresenta o contrato, os papéis, os comandos e os limites daquele exemplo. `src/main.ts` mostra a montagem e o uso; os demais arquivos de `src/` contêm contratos e implementação. Os testes em `test/` ajudam a observar entradas, resultados, mudanças de estado e recusas.

Leia `exercise/README.md` antes de abrir a resposta em `solution/`. Faça sua tentativa numa cópia do projeto e siga os arquivos e critérios indicados no enunciado. O diretório `exercise/` fica fora da compilação oficial: colocar um arquivo ali não faz `npm test` executá-lo automaticamente. No projeto 01, por exemplo, o enunciado propõe uma configuração própria para compilar a tentativa; outros exercícios indicam arquivos específicos da solução para trabalhar na cópia.

Os testes oficiais já incluem a resposta fornecida em `solution/`. Seu sucesso inicial confirma o comportamento dessa versão, não que uma tentativa guardada fora do build tenha sido avaliada. Ao comparar respostas, confira as regras e as recusas esperadas, além da aparência do código.

`diagram.mmd` é a fonte editável do diagrama da base. Exercícios podem acrescentar ou alterar contratos sem aparecer nesse grafo; o README e o enunciado explicam a diferença. `evidence/stdout.txt` e `evidence/solution-stdout.txt` guardam as saídas de referência, sem os banners do npm. Uma mensagem como “recusado” ou “falha simulada” pode ser parte deliberada do exemplo: leia seu contexto antes de tratá-la como erro de instalação.

## Use o runner quando estiver com o repositório completo

A partir da raiz do repositório, o runner escolhe apenas um projeto por número ou nome. Estes comandos trabalham somente com o projeto 01:

```sh
node book-23/scripts/projetos.mjs 01 install
node book-23/scripts/projetos.mjs 01 check
node book-23/scripts/projetos.mjs 01 run
node book-23/scripts/projetos.mjs 01 solution
node book-23/scripts/projetos.mjs 01 verify
```

`install` usa a instalação pelo lock; `check` chama os testes; `run` e `solution` executam as duas demonstrações. Para outro exemplo, troque `01` pelo número do índice. O nome completo, como `19-mediator`, também é aceito.

O runner recusa Node diferente do declarado no projeto. Ele não impõe uma troca automática de npm: confira a versão por conta própria. Uma cópia isolada do projeto não depende desse script externo; os comandos npm internos continuam disponíveis.

`verify` recompila, testa, confere os arquivos inventariados e compara as duas saídas funcionais com as capturas preservadas. Tempos variáveis dos testes não são comparados com os de uma nova execução. O comando não substitui as capturas de referência, embora recrie `dist/` durante o build.

Se você modificou arquivos inventariados, a divergência de hashes é esperada. Primeiro entenda a alteração e confira seu resultado. Para registrar deliberadamente uma versão própria, use `capture` **na sua cópia do repositório, a partir da raiz**, preservando as referências originais:

```sh
node book-23/scripts/projetos.mjs 01 capture
```

Esse comando executa testes e programas e grava `stdout.txt`, `solution-stdout.txt`, `tests.txt` e `manifest.json` em `evidence/`. Ele substitui esses quatro arquivos; não é um comando necessário para apenas ler e executar o material recebido. Uma captura nova registra uma execução, não fornece revisão independente do código.

## Localize seu exemplo

No repositório, estes diretórios ficam em `book-23/code/`. Cada descrição indica a função do exemplo, e o README específico detalha suas regras.

1. `01-factory-method/` — **Factory Method:** variar a criação do mensageiro mantendo a operação comum de envio.
2. `02-abstract-factory/` — **Abstract Factory:** fornecer armas e proteções de famílias compatíveis.
3. `03-builder/` — **Builder:** construir por etapas uma ficha ou um relatório usando receitas de expedição.
4. `04-prototype/` — **Prototype:** clonar e personalizar uma fórmula, com cópia dos dados mutáveis e selo imutável compartilhado.
5. `05-singleton/` — **Singleton:** escolher o ciclo de vida de um registro, com acesso compartilhado por avaliação do módulo e dependências injetadas.
6. `06-adapter/` — **Adapter:** adaptar um fornecedor legado ao contrato esperado, incluindo conversão de velocidade.
7. `07-facade/` — **Facade:** coordenar quatro subsistemas numa preparação, informando etapas prontas ou parciais.
8. `08-decorator/` — **Decorator:** compor efeitos de ataque e observar como a ordem das camadas muda o resultado.
9. `09-proxy/` — **Proxy:** controlar a delegação ao serviço; o exercício apresenta carregamento virtual síncrono.
10. `10-composite/` — **Composite:** aplicar uma ordem a folhas e formações numa árvore parte-todo.
11. `11-bridge/` — **Bridge:** combinar formas de arma e essências em dois eixos de variação.
12. `12-flyweight/` — **Flyweight:** compartilhar essências imutáveis entre aparições com posições próprias e comparar modelos num experimento separado.
13. `13-strategy/` — **Strategy:** trocar a política de ataque sem trocar a identidade do contexto.
14. `14-state/` — **State:** variar ações e transições conforme o estado atual de um guerreiro.
15. `15-template-method/` — **Template Method:** manter a sequência do ritual na base e especializar sua conjuração.
16. `16-command/` — **Command:** guardar solicitações de reserva e desfazer somente parcelas ainda intactas num histórico limitado.
17. `17-memento/` — **Memento:** guardar tokens opacos de capturas e restaurar o estado declarado de um diário.
18. `18-observer/` — **Observer:** inscrever e remover callbacks que reagem a um aviso, com regras de rodada e falha.
19. `19-mediator/` — **Mediator:** coordenar destinatários e ações de um protocolo por etapa, sem retransmitir tudo a todos.
20. `20-chain-of-responsibility/` — **Chain of Responsibility:** percorrer postos e encerrar no primeiro tratamento ou recusa terminal, sem confundir recusa com falta de resposta.
21. `21-iterator/` — **Iterator:** consultar duas representações por capturas de dados e cursores independentes; a ponte para o protocolo nativo e o gerador ficam no exercício.
22. `22-visitor/` — **Visitor:** aplicar operações distintas a três tipos preparados com aceitar e explicitar o custo de incluir um quarto tipo.
23. `23-interpreter/` — **Interpreter:** construir e interpretar expressões de uma gramática pequena, com análise completa e orçamento antes dos efeitos; a repetição pertence ao exercício.

O projeto 12 possui um experimento opcional:

```sh
npm run benchmark -- 100000 3 5
```

Execute-o dentro de `12-flyweight/`, depois da instalação, e siga o protocolo do README e do exercício. Ele gera novas medições; seus números não precisam repetir os de outra execução e não participam da comparação byte a byte das saídas funcionais. Testar correção e medir desempenho respondem a perguntas diferentes.

## Reprodução registrada nesta edição

Os registros de reprodução desta passagem somam **354 testes aprovados nos 23 projetos**: 149 nas execuções do auditor técnico dos projetos 01–09 e 205 nas execuções da coordenação dos projetos 10–23. Os registros distinguem quem executou cada lote e vinculam fontes, comandos e saídas por hashes. Este total reúne testes dos projetos, incluindo suas soluções fornecidas; não é uma nova execução feita durante a redação deste guia.

O conjunto de registros está em `output/fabrica/reescrita-epico-anime-01/execucoes-projetos-restantes-v01/verificacao-coordenacao-v01.json`, com os caminhos dos pareceres e das execuções que o sustentam. As evidências dentro de cada projeto continuam sendo a referência para sua reprodução isolada. Testes aprovados nesses contratos não certificam segurança física da fantasia, revisão literária ou desempenho geral. O experimento opcional de Flyweight conserva seu protocolo próprio de medição.

## Quando um comando não funcionar

Se o runner informar “Runtime divergente”, confira `node --version` no mesmo terminal do comando. Se o compilador local ou uma dependência não for encontrado, confira se você instalou pelo lock dentro do diretório escolhido. Uma divergência entre manifesto e lock precisa ser resolvida na cópia correta; juntar arquivos de projetos diferentes não recompõe esse contrato.

Se houver erro de TypeScript ou teste, leia o arquivo e a regra apontados antes de alterar a saída esperada. Se `verify` informar que fontes ou evidências mudaram, compare com a versão preservada antes de capturar novamente. O README específico é a referência para interpretar o que aquele modelo faz, o que ele recusa e quais efeitos permanecem depois de uma falha.
