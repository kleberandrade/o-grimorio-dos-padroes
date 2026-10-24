# Exercício — Retirar sem romper a árvore

Crie a variante `FormacaoEditavel extends Formacao` e acrescente `remover(unidade): boolean`. A infraestrutura de integridade já oferece a primitiva protegida `desvincularMembro()`, responsável por alterar a lista e liberar o vínculo do pai juntos. Use-a para não duplicar ou corromper a política de árvore.

Critérios verificáveis:

- Remover um filho direto presente devolve `true`; remover ausente ou repetido devolve `false`.
- Uma tentativa de remoção pela formação errada não libera a unidade da formação correta.
- Remover uma subárvore solta apenas seu vínculo externo; os descendentes continuam vinculados dentro dela.
- A subárvore retirada pode ser adicionada a outra formação, com identidade e comportamento preservados.
- A ordem dos irmãos restantes é mantida.
- Auto inclusão, inclusão de ancestral e duplicidade continuam rejeitadas depois da remoção e reutilização.
- `Soldado` continua sem operações de gestão de filhos.

Compare com `solution/formacao-editavel.ts` e `solution/remocao.test.ts`; execute `npm run solution`. Tentativas em `exercise/` não são compiladas junto da resposta oficial.

## Resposta comentada

A política é uma árvore estrita por identidade de objeto: um nó tem no máximo um pai. A variante oferece a remoção pública sem colocar `adicionar()` ou `remover()` em uma folha. A primitiva fornecida localiza somente um filho direto e só apaga seu vínculo de pai quando realmente o encontra; uma remoção ausente não afeta outra árvore.

A retirada e a inclusão no destino são chamadas separadas. Não há transferência atômica nem rollback: o cliente precisa saber se deseja incluir e tratar um erro da inclusão. Um destino descendente não torna válida uma ligação cíclica; as regras de ancestralidade continuam aplicáveis.

`protected` é uma restrição TypeScript para a API de extensão, não uma barreira de segurança JavaScript. A manutenção das regras pelas operações fornecidas não certifica subclasses arbitrárias ou manipulação de protótipos pelo chamador.
