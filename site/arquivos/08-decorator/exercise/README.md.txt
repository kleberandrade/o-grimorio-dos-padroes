# Exercício — O limite também tem posição

Crie `MantoLimitador`, um wrapper que implementa `Ataque`, recebe um ataque interno e um teto inteiro seguro não negativo. Sua potência é `Math.min(potenciaInterna, teto)` e o resultado acrescenta o efeito `limite N` depois dos efeitos internos.

Critérios verificáveis:

- Com núcleo 10, calor +3 e teto 11, calor → limite produz 11; limite → calor produz 13.
- Cada ordem preserva o histórico correto dos efeitos e não modifica a espada.
- O teto precisa obedecer às mesmas fronteiras de representação numérica do projeto.
- Teto zero é válido; o resultado é congelado pelo mesmo helper.
- Uma camada externa de limite não pode ocultar um overflow já recusado pelo componente interno.
- Explique por que limitar antes de somar não garante teto para o resultado final.

Compare com `solution/limitador.ts` e `solution/limitador.test.ts`. Execute `npm run solution`. Tentativas em `exercise/` não são compiladas com a resposta oficial.

## Resposta comentada

O novo decorator conserva o contrato `Ataque` e usa composição. Ele limita somente o resultado que recebe naquele ponto. Por isso `min(10 + 3, 11) = 11`, mas `min(10, 11) + 3 = 13`. A lista de efeitos revela a ordem, em vez de registrar apenas o número final.

Uma composição que já estourou a faixa permitida lança erro antes de entregar um resultado ao limitador. O wrapper não recupera essa execução nem desfaz efeitos de um componente externo arbitrário. Nas implementações fornecidas, executar só calcula valores e não muda o núcleo ou qualquer camada.

Para uma fórmula fixa e conhecida, uma função é uma alternativa menor. O teste de `calcularPotenciaDireta()` no projeto-base demonstra isso. Os wrappers acrescentam valor quando a combinação de responsabilidades precisa ser montada e reutilizada por meio do contrato comum.
