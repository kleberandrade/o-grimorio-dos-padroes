# 10 — Composite: Formações de unidades recursivas

`Unidade.executarOrdem()` é o contrato comum de `Soldado` e `Formacao`. A folha devolve seu evento; a formação registra sua própria entrada e percorre seus membros recursivamente. A operação devolve dados verificáveis, além de permitir formatar uma saída de console.

## Executar

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, lock independente. Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books:

```sh
node book-23/scripts/projetos.mjs 10 install
node book-23/scripts/projetos.mjs 10 check
node book-23/scripts/projetos.mjs 10 capture
node book-23/scripts/projetos.mjs 10 verify
```

O build limpa `dist`, compila ES2022/ESM com TypeScript estrito e executa testes Node sobre JavaScript emitido. Nenhum projeto vizinho é importado. `exercise/` fica separado da solução e fora da compilação oficial.

## Fontes e papéis

- `src/contratos.ts`: Component `Unidade` e evento de relatório.
- `src/arvore.ts`: Leaf `Soldado`, Composite `Formacao` e integridade da árvore.
- `src/main.ts`: dois níveis de formações e três folhas, com relatório completo.
- `src/direto.ts`: alternativa de lista plana executada em teste.
- `test/arvore.test.ts`: ordem exata, folha, identidade, duplicidade, ciclos, cópias e limites.
- `exercise/` e `solution/`: variante editável com remoção e reutilização de subárvore.
- `diagram.mmd`: fonte lógica editável; renderização e QA visual na etapa de arte.
- `evidence/`: stdout real, testes, manifesto e execução em cópia isolada.

## Percurso e resultado

O percurso é **pré-ordem**: primeiro o evento do grupo, depois cada membro pela ordem de inserção. Na demonstração, a sequência é Formação de Mirralis → Pelotão do Norte → Alaric → Elora → Lorn. Há duas entradas completas de formação no stdout, correspondentes aos dois objetos de grupo. Essa é a correção do erro de saída do artigo original, que omitia uma das entradas de grupo efetivamente executadas.

Cada evento contém tipo, nome e ordem. Nome e ordem são normalizados e não podem ficar vazios. O relatório e seus eventos são congelados; cada execução produz novos valores e não altera os relatórios anteriores. Formação vazia ainda gera seu próprio evento. Os dados registram a visita da operação a cada nó, não a execução física de uma retirada, o recebimento de um sinal remoto ou o resultado de um resgate.

## Política de árvore e identidade

`Formacao.adicionar()` aceita os nós fornecidos pelo projeto (`Soldado` ou `Formacao`, incluindo a variante do exercício). Cada objeto pode ter no máximo um pai. Auto inclusão, duplicação do mesmo objeto no grupo, inclusão de ancestral e compartilhamento de um objeto entre grupos são recusados antes de modificar os vínculos. O controle de pai fica em um `WeakMap` interno do módulo e a lista de membros em um campo `#` da formação.

Identidade é a referência do objeto, não seu nome: duas instâncias chamadas Homônimo são dois nós. Essa convenção não deduplica pessoas reais. Para representar a mesma unidade no domínio, o chamador precisa conservar sua referência em vez de criar outro objeto com nome repetido. Não existe catálogo global de pessoas ou garantia de identidade distribuída.

`listarMembros()` devolve uma cópia defensiva do array. Os próprios nós são referências intencionais da árvore, não clones profundos: uma formação continua sendo a mesma quando retirada e reutilizada. Alterar a lista consultada não altera a estrutura nem solta seus vínculos. `Soldado` não oferece filhos, `adicionar()` ou `remover()`; gestão é responsabilidade do Composite.

O modelo é uma árvore, **não um grafo geral**: compartilhamento de subárvore entre dois pais não é permitido. As garantias valem para as operações e classes fornecidas neste módulo; interfaces TypeScript, `protected` e verificações `instanceof` não impedem toda manipulação arbitrária em JavaScript ou a escrita de subclasses que violem contratos. Não é um mecanismo de segurança.

## Remoção e escala

A primitiva protegida `desvincularMembro()` mantém lista e pai consistentes. A solução `FormacaoEditavel` expõe `remover()` publicamente. Remoção ausente devolve `false` e não libera a unidade de outro grupo. Remoção presente libera somente o vínculo externo; os descendentes permanecem ligados à subárvore. Incluir a subárvore retirada em outro grupo preserva sua identidade, e os testes mostram que isso não permite recriar um ciclo.

Remover e incluir são operações separadas, sem transação ou transferência automática. O cliente escolhe a nova estrutura explicitamente. O percurso é síncrono e recursivo; uma árvore extremamente profunda pode atingir o limite da pilha. Não se afirma escala ilimitada, segurança contra mutação externa durante o percurso ou suporte a grafos cíclicos. O relatório é um traço em memória, sem persistência.

## Custos, alternativas e comparações

Composite acrescenta estrutura e uma política de gestão que se justificam quando há relação parte-todo e operações recursivas úteis. Se só existem unidades independentes, `executarListaPlana()` aplica o contrato em uma coleção sem inventar um grupo; o teste demonstra essa alternativa. Uma lista plana não acrescenta hierarquia ou política de pai automaticamente.

Decorator envolve um componente para acrescentar uma responsabilidade à sua operação. Composite reúne zero ou mais componentes em uma estrutura parte-todo e aplica a operação recursivamente. Ter o mesmo contrato ou conter outros objetos não basta para tornar as duas intenções equivalentes.

Testes e hashes vinculam o relatório à execução real; não são auditoria técnica independente ou aprovação do autor e não sustentam promessas de desempenho ou segurança física.
