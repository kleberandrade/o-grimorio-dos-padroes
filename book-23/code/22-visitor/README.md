# 22 — Visitor: O Peregrino dos Objetos

Malu precisa de operações diferentes sobre os mesmos membros de uma guilda: capacidade e custo de abastecimento. Os valores deste projeto são índices e fichas convencionais do modelo. Não medem força física, não distribuem estoque e não certificam justiça. A escolha de uma regra de cálculo e uma decisão de distribuição são responsabilidades distintas.

## A alternativa simples primeiro

`src/union.ts` implementa `avaliarFicha` sobre uma union discriminada com três variantes. Com poucos casos estáveis, um `switch` ou um método do próprio elemento pode ser mais claro que Visitor. `src/main.ts` executa essa alternativa antes do exemplo com visitantes, e os testes comparam seus números. As duas versões coexistem para comparação didática; não se recomenda manter fórmulas duplicadas numa aplicação sem motivo.

Visitor se justifica quando há um conjunto relativamente estável de tipos **preparados para aceitar visitas**, enquanto operações sobre eles variam. Essa preparação não é gratuita: é necessário acrescentar `aceitar` e conectar o tipo concreto ao método de visita correspondente. Uma classe arbitrária sem esse contrato não passa a aceitar visitantes só porque um visitante foi criado.

## Executar

Versões declaradas e utilizadas: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. Lock, `.nvmrc`, `.gitignore` e configuração ESM NodeNext estrita são próprios, sem imports de outros projetos.

Na pasta `book-23/code/22-visitor`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório:

```sh
node book-23/scripts/projetos.mjs 22 install
node book-23/scripts/projetos.mjs 22 check
node book-23/scripts/projetos.mjs 22 run
node book-23/scripts/projetos.mjs 22 solution
node book-23/scripts/projetos.mjs 22 capture
node book-23/scripts/projetos.mjs 22 verify
```

`evidence/stdout.txt` e `solution-stdout.txt` vêm dos programas reais. `manifest.json` vincula versões/fontes/testes/saídas por SHA256. `runner-commands.json` registra os seis comandos do runner; `isolation.json` registra instalação/testes/programas numa cópia temporária só deste projeto e comparação byte a byte das saídas. Tempos de teste variam; não houve benchmark. Evidências do produtor não atribuem auditoria independente nem aprovação humana.

## Contrato e despacho

`Visitante<R>` exige `visitarGuerreiro(Guerreiro)`, `visitarMago(Mago)` e `visitarArqueiro(Arqueiro)`, todos devolvendo `R`. `MembroGuilda.aceitar<R>(visitante): R` é implementado por cada elemento: o guerreiro chama `visitarGuerreiro(this)`, o mago chama `visitarMago(this)` e o arqueiro chama `visitarArqueiro(this)`.

O método do elemento é escolhido pela instância recebida; ele então chama o método nomeado do visitante concreto. Essa colaboração realiza o despacho do exemplo. TypeScript verifica os contratos, mas não instala seleção automática de sobrecarga em execução: os nomes das chamadas estão explicitamente no código. O retorno genérico permite valores numéricos ou, por exemplo, o visitante de crachás em string mostrado nos testes.

Os visitantes leem os campos **públicos legítimos** `nome`, `forca`, `mana` e `pontaria`. Não usam cast para abrir campos privados, reflexão de segredos ou acesso privilegiado. Encapsular dados privados não significa que toda operação externa esteja proibida; é preciso oferecer uma visão pública adequada ao domínio.

## Números e alcance

Nomes devem ser strings não vazias e são normalizados com `trim`. Cada atributo é um inteiro de zero a cem; negativos, frações, NaN, infinito e valores acima de cem são recusados no construtor. Zero é válido e não significa ausência de pessoa.

As fórmulas convencionais são:

- Capacidade: guerreiro `2 × forca`, mago `3 × mana`, arqueiro `2 × pontaria`.
- Custo: guerreiro `forca + 10`, mago `2 × mana + 5`, arqueiro `pontaria + 15`.

`CalcularCapacidade` e `CalcularCusto` são duas operações, não dois nomes para o mesmo relatório. Com índices6/4/5, capacidades12/12/10 somam34; custos16/13/20 somam49. Os totais pertencem a escalas distintas e não devem ser somados entre si. Nenhum deles consome mana, reduz força ou debita suprimentos reais.

`totalizar(membros, visitante)` aceita resultados inteiros seguros não negativos, verifica o valor e a soma e devolve zero para coleção vazia. Uma extensão que retorne NaN, infinito, fração, negativo ou cause overflow é recusada. O contrato numérico não prova honestidade do cálculo nem adequação da fórmula ao mundo.

## Extensão, cópias e limites

Uma nova **operação** pode implementar `Visitante<R>` e usar os três elementos já preparados, sem editar seus métodos. Os testes acrescentam um visitante de crachás e verificam o despacho por identidade, não só por texto impresso. Isso não significa que Visitor esteja aberto simultaneamente a qualquer novo **tipo** de elemento: todos os visitantes precisam saber o que fazer com ele.

Os membros possuem somente campos escalares, recebem esses valores no construtor e são congelados por `Object.freeze`. Os visitantes fornecidos apenas leem esses campos e devolvem números; testes verificam preservação dos membros e do array de entrada. `readonly` é restrição estática e não substitui esse congelamento de instância em execução. [TypeScript — Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html#readonly).

Não há clone profundo genérico, congelamento de protótipos, autenticação ou proteção contra código hostil que modifique dependências. Um visitante externo pode ter estado e efeitos: a interface não garante pureza. Se ele lançar erro, a exceção propaga; efeitos anteriores não são revertidos e não há resultado agregado concluído. O parâmetro genérico conserva o tipo de retorno na compilação, sem validar todo objeto vindo de JavaScript sem tipos. [TypeScript — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-interfaces).

As chamadas fornecidas são síncronas. `totalizar` não é uma operação assíncrona e não espera Promises. Os nomes dos ofícios e fórmulas pertencem a este exemplo; não implementam um sistema geral de permissões, classificação de pessoas ou economia.

## O custo do quarto tipo

O exercício usa uma **versão ampliada separada**, em `solution/`, para conservar a base de três tipos executável. `VisitanteAmpliado<R>` acrescenta `visitarCurandeiro`, `MembroAmpliado` aponta para esse contrato e `Curandeiro` instala seu próprio despacho. As versões ampliadas de **ambos os visitantes de produção** implementam a nova operação tipada. Os três elementos anteriores continuam chamando os mesmos métodos, mas a versão do exercício usa os novos nomes/imports de contrato. Não se remove import inexistente nem se aplica correção manual para compilar: `npm test` e `npm run solution` compilam a solução inteira.

O enunciado lista as alterações exatas. Não se deve inserir um Curandeiro na base e forçar um cast do visitante antigo: ele não adquiriu `visitarCurandeiro`. Qualquer outra operação adicionada depois também precisará definir a visita ao novo tipo. O visitante de crachá da base, por exemplo, precisaria da nova regra se migrasse para o universo de quatro tipos.

## Custos e comparações

A cada membro, o totalizador faz uma aceitação/visita e uma soma; soma-se o trabalho da operação concreta. Muitos tipos multiplicam métodos em cada visitante. Muitos visitantes multiplicam o trabalho de incluir um tipo novo. O projeto não mantém cache ou snapshot da coleção nem impede alteração externa de um array enquanto uma extensão executa; as operações fornecidas não o alteram. Há alocações dos membros e dos resultados da alternativa union, sem benchmark de desempenho.

Iterator oferece percurso; Visitor oferece uma operação tipada para cada elemento que aceite a visita. Uma iteração, como o `reduce` deste projeto, pode aplicar um visitante sem se tornar outra implementação manual de Iterator. Uma função sobre union discriminada mantém o conjunto de casos visível e pode ser mais direta. Um método próprio coloca a operação no elemento; introduzir Visitor cobra preparação e interfaces em troca da separação de operações. Se os tipos mudam frequentemente, esse custo pode superar o benefício.

## Fontes e arquivos

`referencias.json` registra consultas primárias reais ao Handbook oficial do TypeScript em23/10/2026. O site é vivo e não prova versão do compilador local; os programas foram efetivamente compilados com5.9.3. A intenção editorial deriva do corpus autoral/T03/adendo/plano, sem citações históricas inventadas ou API de framework externo.

`src/contratos.ts`: contratos/validações. `src/membros.ts`: elementos preparados. `src/visitantes.ts`: duas operações e agregação. `src/union.ts`: alternativa. `src/main.ts`: saída real. `test/visitor.test.ts`: base e extensão de operação. `solution/`: versão ampliada com quatro tipos. `diagram.mmd`: somente a base.
