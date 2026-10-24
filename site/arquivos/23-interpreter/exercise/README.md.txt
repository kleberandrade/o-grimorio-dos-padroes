# Exercício — Repetição sem expansão explosiva

Acrescente sufixo de repetição a um terminal ou grupo, preservando a análise completa antes de interpretar:

```text
programa  := sequencia EOF
sequencia := termo { termo }
termo     := atomo [ "*" contador ]
atomo     := "F" | "I" | "L" | "(" sequencia ")"
contador  := "1" | "2" | ... | "9"
```

Separadores aceitos continuam exatamente espaço/tab/LF/CR. Não há repetição zero, contagem multidígito ou dois sufixos no mesmo átomo: use um grupo se quiser compor repetições. `F*2*2` é inválido, enquanto `(F*2)*2` é válido. Os limites continuam256 unidades UTF16, oito grupos aninhados e orçamento64 aplicações por programa. O orçamento é global e usa posição0 por convenção.

Critérios:

1. `Repeticao` guarda uma referência ao corpo e o contador1..9. Seu custo é multiplicação validada, sem expandir cópias da AST.
2. `(FI)*2L` interpreta F,I,F,I,L. Contagem1 preserva a sequência;0 é erro na posição da contagem.
3. `F*10`, contador ausente, sufixo duplo e símbolo desconhecido devem ser recusados sem executar o prefixo.
4. `((F*9)*9)` custa81 e é recusado antes de qualquer aplicação. `(FFFFFFFF)*8` custa64 e é aceito; acrescentar F custa65 e é recusado sem efeito adicional.
5. Preservar regras da base e documentar o que mudou. Falha posterior do contexto continua sem rollback.

## Resposta comentada

`solution/repeticao.ts` implementa a nova expressão. `solution/parser-ampliado.ts` é a versão alterada do parser: após analisar o átomo, lê no máximo um asterisco e um dígito válido, recusa multidígito e cria `Repeticao`. A base não foi editada; a extensão exigiu explicitamente mudar a produção de termo e o código que constrói esse nó. Não se afirma que basta acrescentar uma classe sem ensinar a sintaxe ao parser.

`solution/conjurar.ts` analisa toda entrada ampliada e só então usa o pré-verificador/interpretador comum. O cálculo do custo não expande AST nem executa contexto. Os testes medem inclusive custo `9 ** 8` numa árvore curta, que é recusado pelo orçamento; não tentam executar milhões de aplicações. A garantia depende dos custos honestos das expressões fornecidas, sem sandbox para extensões hostis.

`solution/repeticao.test.ts` verifica ordem, contagens inválidas, limites, composição e ausência de efeitos. Execute `npm test` e `npm run solution`, sem apagar imports ou editar a base para compilar. Uma ferramenta de parser ou DSL existente pode ser mais adequada quando a linguagem crescer; este exercício não é uma proposta de compilador geral nem um mecanismo de abrir portas físicas.
