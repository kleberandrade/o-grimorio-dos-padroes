# Exercício — O fornecedor marítimo

Integre um segundo fornecedor que informa velocidade em **nós** e expõe `aquecerRocha(identificador)` em vez de `soltarFogo(alvo)`. Ele também oferece somente fogo.

Critérios verificáveis:

- Um novo adaptador por composição atende `DragaoNovo`; `liberarRochaDoFarol()` não muda.
- 10 nós produzem aproximadamente `5.144444444444444` m/s; compare com tolerância, não como igualdade decimal exata geral.
- O fator usado é `1852 / 3600`, sem arredondamento antecipado.
- O alvo chega ao fornecedor normalizado e a indicação de liberação é preservada, inclusive quando for `false`.
- Pedido de gelo é recusado antes de acionar o fornecedor.
- Velocidade não finita é diagnosticada.
- Nenhuma edição é necessária na biblioteca antiga ou no fornecedor marítimo.

Compare com `solution/fornecedor-maritimo.ts`, `solution/adapter-maritimo.ts` e `solution/maritimo.test.ts`. Execute `npm run solution`. `exercise/` fica fora do build oficial para não compilar a tentativa junto da resposta.

## Resposta comentada

O adaptador converte os dados e a chamada, não apenas os nomes: nós viram m/s, `identificador` vira `alvo` e `liberada` vira `rochaLiberada`. O erro do efeito sem equivalente mantém o limite do pacto. O cliente não precisa saber de qual fornecedor veio o resultado.

O programa formata a velocidade com três casas decimais só na saída humana. O teste mantém o resultado numérico e usa tolerância absoluta de `1e-12` m/s para esse caso pequeno. Isso não declara uma tolerância física universal nem valida velocidade de um animal real.

Se ambos os contratos forem controlados pela mesma equipe, alterar a API diretamente pode ser mais claro que manter duas superfícies e um adaptador. Uma função ou um objeto literal também poderia cumprir `DragaoNovo`; uma classe não é exigência do mecanismo de adaptação por composição.
