# Exercício — Ponte ao protocolo JavaScript e gerador

Acrescente suporte nativo ao percurso **num wrapper separado**, sem alegar que a base já tem `[Symbol.iterator]`. Compare a implementação manual da ponte com um gerador que preserve o mesmo instante de snapshot.

Critérios:

1. `ArquivoIterable` recebe `ArquivoOrdens` e implementa `[Symbol.iterator]()` devolvendo um iterador novo a cada chamada. Capture nessa chamada, antes do primeiro `next`, e traduza `fim/ordem` para `done/value`.
2. O iterador retornado também deve ser iterável e fornecer `return()` terminal. `break` encerra essa instância; criar outro iterador não é reiniciar o anterior.
3. `gerarSnapshot` deve ser uma fábrica **não geradora** que captura o percurso e só depois devolve o gerador. Não ponha a captura dentro do corpo preguiçoso.
4. Teste edição entre criação e primeiro `next` nas duas variantes, independência, vazio, esgotamento e `break`/`return`.
5. Explique a diferença entre criação do wrapper e criação do percurso, e entre Iterator GoF local e protocolo JavaScript.

## Resposta comentada

`solution/iteravel.ts` adapta o contrato local em `ArquivoIterable`: snapshot ao chamar `[Symbol.iterator]`, fechamento por flag privada na closure e retorno da própria instância em seu `[Symbol.iterator]`. O wrapper não é o arquivo original. Cada percurso nativo novo recebe um snapshot novo; repetir uma instância esgotada não recria posição.

`gerarSnapshot` chama `origem.criarPercurso()` **antes** de invocar a função geradora interna. A declaração dessa função não executa imediatamente seu corpo; o snapshot já capturado fica disponível quando ela avança. Assim, a mutação após a fábrica e antes do primeiro passo não entra no lote. Essa fronteira é verificada com contador de capturas e comparação dos dados, não inferida só da saída.

A base não precisou ser alterada: a ponte e a fábrica são novos arquivos que compõem `ArquivoOrdens`. O diagrama principal permanece sem `Iterable` nas classes da base. A solução não afirma que objetos `IteratorResult` do gerador são congelados; as ordens entregues são as cópias congeladas do percurso.

Execute `npm test` e `npm run solution`. Quando uma coleção nativa já oferece a política necessária, usar diretamente `for...of` é mais simples. Nem o wrapper nem o gerador eliminam o custo do snapshot deste projeto ou implementam iteração assíncrona. Referências primárias e evidência do exemplo nativo estão em `../referencias.json` e `../src/nativo.ts`.
