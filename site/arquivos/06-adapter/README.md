# 06 — Adapter: Integração de dragões legados

O cliente usa `DragaoNovo`, com velocidade em **m/s** e ataque que devolve resultado. `DragaoAdapter` compõe `DragaoAntigo`, converte **km/h** para **m/s**, traduz o alvo e o resultado de fogo, sem editar a biblioteca legada. Uma implementação nativa atende ao mesmo contrato diretamente.

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
node book-23/scripts/projetos.mjs 06 install
node book-23/scripts/projetos.mjs 06 check
node book-23/scripts/projetos.mjs 06 capture
node book-23/scripts/projetos.mjs 06 verify
```

O build limpa `dist`, usa `tsc` local estrito para ES2022/ESM e testa o JavaScript emitido com `node:test`. Não importa capítulos vizinhos. Tentativas em `exercise/` ficam fora da compilação da resposta.

## Papéis e arquivos

- `src/contratos.ts`: Target `DragaoNovo`, pedido, resultado e erro de recurso indisponível.
- `src/legado/dragao-antigo.ts`: Adaptee, biblioteca simulada que só oferece velocidade em km/h e fogo.
- `src/adapter.ts`: Adapter por composição, com conversão numérica e delegação.
- `src/nativo.ts`: implementação nativa do Target, sem camada de tradução.
- `src/cliente.ts`: `liberarRochaDoFarol()`, cliente independente de fornecedor.
- `src/validacao.ts`: valores de velocidade e alvo não vazio.
- `src/main.ts`: mesmo cliente para nativo/adaptado e ordem sem equivalente recusada.
- `test/adaptacao.test.ts`: conversão, contrato comum, chamadas delegadas, erros e fidelidade do resultado.
- `exercise/` e `solution/`: segundo fornecedor em nós, outro adaptador e testes.
- `diagram.mmd`: fonte editável das relações do código-base; renderização e QA visual ficam na etapa própria.
- `evidence/`: stdout real, testes, manifesto e execução em cópia isolada.

## Contrato do cenário novo

O arquivo legado é uma biblioteca **simulada para este livro**, com unidade declarada em seu contrato. Não é reprodução literal do snippet do Medium: aquele exemplo devolvia `100` sem declarar uma unidade. A convenção de km/h e o resultado observável são parte desta reescrita; não se afirma que aquele `100` originalmente significava km/h.

O adaptador recebe a biblioteca e só usa suas operações públicas. `voarVelocidade()` retorna km/h; o adaptador divide por `3.6`. `soltarFogo(alvo)` retorna `{rocha, desobstruida}`; o adaptador traduz para `{alvo, efeito: 'fogo', rochaLiberada}`. O campo booleano é preservado, inclusive quando o fornecedor relata `false`. O resultado é copiado e congelado, sem manter alias mutável do retorno legado.

`DragaoNovo.atacar()` permite pedir `fogo` ou `gelo`, com possibilidade contratual de lançar `RecursoSemEquivalente` quando o pacto não oferecer aquele efeito. Os dois fornecedores-base oferecem fogo e recusam gelo; não se inventa um equivalente. A recusa acontece antes de delegar a operação. Alvos vazios são rejeitados antes de chamar o legado. Exceções do fornecedor são propagadas.

`liberarRochaDoFarol()` consulta a velocidade e solicita fogo sobre um identificador de rocha. Retorna dados locais do ensaio. Não transporta pessoas, não movimenta o contrapeso, não modela cabos, massa, forças ou dano térmico e não confirma que um farol físico foi liberado. A narrativa contém o resgate e o pacto; o código demonstra a tradução do contrato disponível. `rochaLiberada` é o resultado declarado pelo simulador, sem sensores ou comprovação física.

Velocidade negativa ou não finita é inválida; zero é aceito como valor numérico e não prova capacidade de transporte. Entradas são tipadas; o programa não valida JSON arbitrário nem decide se qualquer objeto nomeado é uma rocha. `private` nos parâmetros de construtor é checagem TypeScript, não barreira de segurança em execução.

## Números, teste e alternativa

O caso 36 km/h → 10 m/s permite igualdade numérica no exemplo executado. Casos fracionários são testados com tolerância absoluta `1e-12` m/s nos valores pequenos usados. A solução converte nós pelo fator `1852 / 3600` e só arredonda a apresentação com `toFixed(3)`. Não se afirma que todos os números flutuantes tenham equivalência decimal exata, nem se escolhe tolerância para medições reais.

Adapter acrescenta uma camada e regras de tradução que precisam acompanhar os contratos. Se você controla as duas APIs e pode mudar uma delas de modo compatível com seus consumidores, uma alteração direta pode eliminar a necessidade da camada. Uma função que devolve um objeto com `velocidadeMps` e `atacar` também pode ser um adaptador; a classe aqui explicita composição e papéis. Os testes usam fornecedores substitutos para observar dados e delegações sem modificar o legado.

Facade oferece entrada conveniente para subsistemas; Adapter atende a um contrato já esperado por um cliente. Bridge separa dimensões de variação planejadas para evoluir; Adapter reconcilia interfaces existentes. A presença de composição ou de uma classe chamada ponte não define essas intenções por si.

## Referência e rastreabilidade

O fator do exercício é conferido no [NIST Guide to the SI — unidades fora do SI](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si): um nó corresponde a uma milha náutica por hora, com `1852 / 3600` m/s. Consulta em 22/10/2026. A conversão é verificada também pela execução dos testes no runtime fixado.

Saídas e hashes vinculam a execução às fontes. Não representam auditoria técnica independente, aprovação do autor, benchmark ou garantia de integração com uma biblioteca externa real.
