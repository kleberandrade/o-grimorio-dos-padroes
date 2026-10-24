# 11 — Bridge: Armas e essências independentes

`Arma` é a abstração de alto nível e mantém uma `Essencia` por composição. Espada e Arco variam forma, gesto e custo-base; Fogo e Gelo variam efeito, custo e restrição de ativação. Nenhuma classe representa um par específico.

## Executar

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, lock próprio. Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books:

```sh
node book-23/scripts/projetos.mjs 11 install
node book-23/scripts/projetos.mjs 11 check
node book-23/scripts/projetos.mjs 11 capture
node book-23/scripts/projetos.mjs 11 verify
```

O build limpa `dist`, compila ES2022/ESM com TypeScript estrito e testa o JavaScript emitido com Node. Nenhum capítulo vizinho é importado. `exercise/` fica fora da compilação da solução oficial.

## Papéis e arquivos

- `src/armas.ts`: Abstraction `Arma` e Refined Abstractions `Espada`/`Arco`.
- `src/contratos.ts`: Implementor `Essencia`, contexto e resultados discriminados.
- `src/essencias.ts`: Concrete Implementors `EssenciaFogo`/`EssenciaGelo`.
- `src/resultado.ts`: combinação dos resultados da forma e da implementação, com limites numéricos.
- `src/direto.ts`: alternativa de função para uma forma fixa.
- `src/main.ts`: matriz 2×2, troca de essência mantendo a arma e restrição observável.
- `test/ponte.test.ts`: matriz, identidade, independência dos resultados, nova implementação e erros.
- `exercise/` e `solution/`: Escudo e Vento, com cinco pares novos testados.
- `diagram.mmd`: fonte editável dos dois eixos; renderização e QA visual na etapa de arte.
- `evidence/`: stdout real, testes, manifesto e execução em cópia isolada.

## Comportamento e contrato entre os eixos

O custo-base da Espada é 1 e seu gesto é `corte`; o Arco custa 2 e produz `disparo`. Fogo custa 3 e acrescenta `calor`; Gelo custa 4 e acrescenta `frio`. Com núcleo seco, os quatro pares produzem custos 4, 5, 5 e 6. Os efeitos são dados de resultado ordenados como gesto da forma → efeito da essência.

Nesta versão fictícia, fogo **não ativa com núcleo molhado** e gelo pode ativar nesse contexto. Um bloqueio devolve estado `bloqueado`, motivo, custo zero e lista vazia de efeitos; o gesto não é declarado executado. Em caso ativo, o resultado tem estado `executado`, forma, essência, custo e efeitos. O custo não é descontado de nenhum estoque ou reserva: é um índice de contabilização do ensaio, sem unidade física.

`trocarEssencia()` muda explicitamente a referência guardada na mesma arma. O teste prova a identidade da arma, a referência exata da essência injetada e que outra arma usando a essência anterior conserva seu vínculo. Não se reconstrói nem se altera a essência anterior. A troca não modifica valores de resultados já entregues.

Cada execução das implementações fornecidas cria um resultado e uma lista de efeitos novos e congelados. Os dados são strings/números, sem outro nível mutável nessa saída. O contexto não é guardado na arma. As essências fornecidas não acumulam estado, mas o contrato não garante pureza de implementações externas: uma essência pode ter seu próprio estado, efeitos ou falhas. Exceções são propagadas, sem retorno de sucesso ou mudança automática de essência.

Custos ativos e sua soma precisam ser inteiros seguros não negativos; zero é válido para uma essência de teste. Valor inválido ou soma fora da faixa segura lança erro. A validação se limita ao contrato numérico deste modelo, não é um validador genérico de JSON, uma verificação física de armas ou um mecanismo de segurança.

## Extensões, alternativas e custos

Adicionar Vento e Escudo requer uma classe por eixo e testes das combinações relevantes. Não se edita Espada, Arco, Fogo ou Gelo. A independência tem uma condição: a nova implementação precisa atender `Essencia` e as formas precisam usar o contrato combinado. Um recurso novo que exija outra capacidade pode forçar mudanças desse contrato; Bridge não garante compatibilidade universal.

Dois eixos acrescentam tipos, dependências e combinações a verificar. Se só uma forma existe e apenas a essência varia, `empunharEspadaDireta()` compõe a essência por uma função; o teste compara seu resultado ao da Espada. Não é necessário criar uma hierarquia para uma segunda dimensão sem pressão real de evolução.

Adapter reconcilia interfaces existentes que não atendem ao contrato esperado. Aqui formas e essências foram projetadas para cooperar desde o início por uma interface comum. Strategy costuma encapsular uma política ou algoritmo substituível em um contexto. Bridge separa dois eixos de abstrações e implementações que precisam evoluir; poder trocar um objeto em execução é uma característica estrutural compartilhada, não a definição da intenção.

As regras de fogo, gelo e custo são convenções novas do projeto, não propriedades químicas ou físicas. O código não conduz um ataque real, testa material, preserva uma ponte ou garante segurança de transporte. Não há inferência de ganho de desempenho ou economia de memória. Testes e hashes ligam a saída às fontes executadas; não substituem auditoria técnica independente ou aprovação do autor.
