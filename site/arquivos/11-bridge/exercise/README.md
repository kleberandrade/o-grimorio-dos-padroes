# Exercício — Uma forma e uma essência novas

Adicione `Escudo extends Arma`, com gesto `aparar` e custo de forma 2. Adicione também `EssenciaVento implements Essencia`, com custo de ativação 2 e efeito `impulso`, sem a restrição de núcleo molhado neste modelo.

Critérios verificáveis:

- Espada e Arco existentes aceitam a nova essência e produzem custos 3 e 4, respectivamente.
- Escudo aceita Fogo, Gelo e Vento, com custos 5, 6 e 4.
- Escudo de fogo preserva o bloqueio com núcleo molhado; trocar sua essência por vento libera o uso sem construir outro escudo.
- Resultados seguem o contrato comum e preservam efeitos próprios da forma e da essência.
- Conte classes adicionadas, classes existentes alteradas e combinações cobertas por teste.
- Explique por que uma função basta quando só há uma forma fixa.

Compare com `solution/extensoes.ts` e `solution/extensoes.test.ts`; execute `npm run solution`. Tentativas em `exercise/` ficam fora do build oficial.

## Resposta comentada

Foram adicionadas **duas classes**, uma em cada eixo: `Escudo` e `EssenciaVento`. Nenhuma definição das classes existentes precisou ser editada. Os pontos de composição e testes são novos códigos de uso; isso não significa que nenhuma linha de código foi acrescentada ao projeto.

A matriz passa de quatro para nove combinações possíveis entre três formas e três essências. Os quatro pares anteriores são testados no projeto-base e os cinco novos na solução. Não foram criadas classes `EscudoDeFogo`, `EscudoDeGelo` ou `EspadaDeVento`.

Essa independência depende do contrato combinado entre os eixos. Uma essência que exigisse outra capacidade de todas as formas poderia cobrar uma mudança de interface e reconferência das implementações. O padrão não promete encaixe universal de qualquer novo recurso.

Para uma única forma, `empunharEspadaDireta()` demonstra uma função que compõe a essência sem acrescentar a hierarquia de `Arma`. Criar dois eixos abstratos sem duas pressões reais de variação acrescentaria indireção desnecessária.
