# Exercício — A galeria com proteção especial

Usando as receitas existentes de torre e galeria como referência, escreva uma receita `prepararGaleriaComFiltro(builder, nome)`. Preserve a proteção contra água e acrescente um equipamento com nome `Máscara com filtro` e proteção `fumaca`, sem alterar `EtapasDeExpedicao` nem os builders.

Critérios:

- A mesma receita deve atender `PersonagemBuilder` e `RelatorioBuilder`.
- A ficha contém proteção contra água e a proteção especial; o relatório inclui a máscara.
- Reutilizar o builder com a receita de galeria original remove a máscara, pois a receita começa com `reiniciar()`.
- O resultado anterior permanece independente e imutável.
- Produza a mesma ficha usando `criarFichaDireta()` com um objeto de opções e compare os valores.
- Explique quando os dados já disponíveis tornam a função direta preferível ao processo por etapas.

Compare com `solution/protecao-especial.ts` e seus testes. `exercise/` fica fora do build oficial para não compilar a tentativa junto da resposta. A solução executável pode ser rodada com `npm run solution`.

## Resposta comentada

A nova receita chama `DiretorDeResgate.prepararGaleria()` e acrescenta um equipamento antes de pedir o resultado ao builder concreto. O contrato já aceita listas de proteções; nenhuma etapa nova é necessária. Isso mostra uma extensão dentro das categorias existentes, sem alegar que qualquer nova regra de domínio dispensará mudança no contrato.

Os testes comparam a ficha com a função direta e observam a máscara no relatório. A expressão `fumaca` é uma etiqueta do modelo: não valida filtro, composição do ar ou resistência humana. A validação original continua exigindo somente `agua` na missão galeria; tornar o filtro obrigatório em uma nova missão exigiria ampliar e testar essa regra explicitamente.

A função direta precisa de menos objetos e chamadas quando todos os dados chegam juntos e não há receitas nem representações alternativas. O Builder se justifica quando a construção por etapas e sua reutilização oferecem clareza que compense o rascunho e as classes adicionais.
