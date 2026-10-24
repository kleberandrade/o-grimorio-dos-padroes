# Exercício — Medir antes de prometer

Compare os modelos com e sem compartilhamento na **mesma carga** antes de afirmar qualquer ganho. O experimento fornecido constrói exatamente as mesmas aparições, tipos, cores e posições nos dois modelos; somente a identidade compartilhada das essências muda.

Após `npm ci --ignore-scripts`, execute:

```sh
npm run benchmark -- 100000 3 5
npm run benchmark -- 100000 1 5
```

Os argumentos são contagem, cardinalidade de tipos suportados e repetições por modelo. Não mude simultaneamente posição, contagem e payload para tentar favorecer uma versão. O segundo comando varia apenas a cardinalidade em relação ao primeiro; cada experimento continua comparando dois modelos equivalentes.

Critérios verificáveis:

- Registre processos separados, versões, parâmetros, unidades, baseline, deltas e observações completas.
- Confira que os hashes dos dados são iguais entre os modelos e que as contagens de aparições coincidem.
- Verifique as identidades intrínsecas: sem compartilhar há uma essência por aparição; com Flyweight há uma por tipo utilizado.
- Relate tempo de construção separadamente de memória retida; não some categorias de memória sobrepostas.
- Compare mínimo, mediana e máximo das repetições, descrevendo variação e limites.
- Aceite resultado pequeno, contraditório ou inconclusivo; não transforme uma porcentagem mínima de ganho em teste de correção.

`npm run solution` mostra uma conferência funcional determinística com seis aparições e cardinalidades 1 e 3. As medições reais ficam separadas em `evidence/experimentos/<captura>/resultados.json`; não fazem parte do stdout funcional e não precisam repetir os mesmos bytes em outra máquina ou execução.

## Resposta metodológica comentada

Os dois modelos usam as mesmas classes `Aparicao` e `EssenciaEspirito`. A versão independente constrói uma essência nova para cada ocorrência; a outra consulta a fábrica. O programa não adiciona texturas falsas, buffers grandes ou payload sintético para inflar uma diferença: o intrínseco permanece apenas tipo/cor, e strings iguais podem ser internadas pelo runtime. Uma diferença pequena também é um resultado válido.

Cada observação roda em processo novo, com a mesma sequência determinística de tipos e posições. A ordem dos modelos alterna entre repetições. O cenário permanece retido explicitamente durante a leitura de memória; o hash e o conjunto de identidades são calculados depois, fora da medição. GC exposto é solicitado, mas isso não garante coleta completa, heap mínimo ou RSS exato.

O intervalo de tempo inclui validação, tabela quando usada, construção de objetos e congelamento. Não inclui inicialização do processo, aquecimento, GC, leituras de memória ou conferência de hash. `performance.now()` mede tempo decorrido, não CPU exclusiva. A mediana resume estas amostras locais; não é evidência universal nem análise estatística de significância.

Com poucos objetos ou pouca repetição, manter e consultar a tabela pode não compensar. A cardinalidade suportada desta implementação é de até três tipos: variar entre 1 e 3 não demonstra o custo de uma cardinalidade ilimitada. Não invente outros tipos sem mudar e testar o contrato.
