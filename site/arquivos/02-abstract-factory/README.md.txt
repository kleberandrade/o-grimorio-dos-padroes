# 02 — Abstract Factory: Kits elementais compatíveis

Duas escolas oferecem arma e proteção. O cliente recebe uma `FabricaElemental`, cria cada categoria separadamente, emite um pulso da arma e o submete à proteção. Brasa coopera com brasa, geada com geada; a mistura é rejeitada com erro explícito.

## Ambiente e comandos

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. O lock fixa as dependências. Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books, o runner existente seleciona apenas este projeto:

```sh
node book-23/scripts/projetos.mjs 02 install
node book-23/scripts/projetos.mjs 02 check
node book-23/scripts/projetos.mjs 02 capture
node book-23/scripts/projetos.mjs 02 verify
```

O build limpa `dist`, compila com checagem estrita e executa testes Node sobre o JavaScript emitido. Não importa o projeto 01 ou qualquer capítulo vizinho. `exercise/` não é compilado com a resposta.

## Arquivos

- `src/contratos.ts`: Abstract Factory, categorias de produtos e valores de entrada/saída.
- `src/brasa.ts` e `src/geada.ts`: fábricas concretas e seus produtos concretos.
- `src/ensaio.ts`: regras locais comuns de intensidade e compatibilidade.
- `src/cliente.ts`: `ensaiarKit`, dependente só dos contratos.
- `src/main.ts`: seleção de fábricas, duas famílias válidas e mistura rejeitada.
- `test/familias.test.ts`: cooperação, substituição, erros e limites.
- `exercise/README.md`: proposta e resposta comentada sobre o custo de nova categoria.
- `solution/`: terceira família de vento e seus testes.
- `diagram.mmd`: fonte editável das relações do projeto-base.
- `evidence/`: stdout real, testes, versões e hashes.

## Garantias e limites

O simulador aceita intensidade positiva finita, inclusive fracionária. A arma valida antes de criar o pulso; a proteção valida também pulsos criados externamente. Em cada ensaio, a proteção compara sua afinidade com a do pulso e devolve um resultado imutável com nomes de arma/proteção e intensidade preservada. A intensidade é uma unidade abstrata de teste, sem modelo de energia, desgaste ou resistência física.

As interfaces não usam genéricos para prender uma família no sistema de tipos: a mistura entre categorias compila e é rejeitada em execução. `FabricaElemental` também permite implementar uma fábrica incoerente; o teste negativo demonstra essa fronteira. A mesma etiqueta de afinidade não comprova qualidade de equipamento, funcionamento mágico real nem autenticidade de produtos maliciosos. Não é validação de JSON arbitrário. `readonly` é restrição estática; somente os pulsos/resultados têm `Object.freeze` em execução. Não há estado persistente, rede ou consumo de material escondido nos testes.

## Intenção, alternativa e custo

Abstract Factory organiza **famílias de produtos relacionados**, e cada método pode criar somente um produto por chamada. A quantidade de objetos não define o padrão. Aqui o cliente troca uma fábrica por outra para obter arma e proteção da mesma escola. Criar o par diretamente é mais simples quando há uma única família estável.

Adicionar uma família requer seus dois produtos e a fábrica, preservando o cliente. Adicionar uma categoria exige ampliar a interface das fábricas e atualizar todas as implementações. A solução de vento demonstra o primeiro caso; o exercício explica o segundo sem introduzir equipamento desnecessário.

Factory Method varia a criação por sobrescrita num Creator com operação comum. As fábricas deste projeto implementam uma interface por composição no cliente; não há operação herdada canônica. Uma Abstract Factory pode ser implementada usando Factory Methods, mas o objetivo continua sendo a família. Builder trata da construção por etapas; este exemplo fornece produtos prontos.

Execução bem-sucedida e hashes não equivalem a auditoria técnica independente nem aprovação do autor. A renderização e inspeção visual do Mermaid pertencem à etapa própria de arte.
