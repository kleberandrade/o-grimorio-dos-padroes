# Exercício — O armazenamento também muda

Acrescente um componente mutável `Armazenamento` com `limiteGraus: number` e `etiquetas: string[]`. Escolha sua política de cópia explicitamente: original e clone precisam poder ajustar condições e anotações de armazenamento sem contaminar um ao outro. O selo de procedência permanece compartilhado e imutável.

Critérios verificáveis:

- O clone preserva o comportamento da poção e o componente novo.
- Mudar o limite e as etiquetas de qualquer exemplar não altera o outro.
- A entrada mutável de armazenamento é copiada na construção; a consulta também não expõe o estado interno.
- O selo continua sendo a mesma referência congelada.
- Lote inválido e limite não finito são diagnosticados.
- Compare esta extensão com a criação direta de uma poção quando todos os valores são conhecidos.

Compare com `solution/pocao-com-armazenamento.ts` e `solution/armazenamento.test.ts`. A demonstração pode ser executada com `npm run solution`. `exercise/` fica fora do build oficial para não compilar duas versões do mesmo exercício.

## Resposta comentada

A solução cria `PocaoComArmazenamento`, que sobrescreve `clone()` e constrói o novo objeto a partir do estado atual. Copia o componente novo e a lista de etiquetas; o código-base continua responsável por copiar ingredientes e preservar o selo. O tipo concreto do clone continua sendo `PocaoComArmazenamento`.

Uma subclasse que não sobrescrevesse `clone()` herdaria a implementação que devolve `Pocao`, perdendo o componente extra. Esse custo faz parte da manutenção da política de cópia. Composição também seria possível, mas exigiria declarar e testar a propagação do clone no objeto composto.

O limite numérico é um dado de configuração, sem modelo de conservação real. Nenhuma temperatura segura para substâncias reais é recomendada. Para valores todos explícitos, o construtor direto é uma alternativa menor, como demonstra o teste de equivalência dos dados no projeto-base. Essa equivalência de valores não torna a construção direta um clone nem prova ganho de desempenho.
