# Exercício — Inspeção opcional antes de selar

A base original não possui um hook de inspeção. Prepare uma versão alterada dela, preservada em arquivo separado, que acrescente `aposEncantamento(encantamento)` depois de conjurar e antes de selar. O hook padrão deve não realizar ação, permitindo que uma subclasse o ignore. Outra subclasse deve poder recusá-lo lançando erro.

Critérios:

1. A ordem deve ser preparar → conjurar → hook → selar.
2. Uma recusa no hook deve manter os ingredientes e o encantamento, registrar falha nessa etapa e deixar o selo nulo.
3. A aprovação deve permitir o selo. Uma subclasse sem override do hook deve continuar funcionando.
4. Instalar o hook precisa ser uma alteração explícita da base; não basta declarar um método nunca chamado.
5. Documente quais contratos e arquivos mudaram e que efeitos anteriores não são revertidos.

## Resposta comentada

`solution/ritual-com-hook.ts` é a versão alterada do template, sem editar a base principal. Ela acrescenta o método protegido concreto `aposEncantamento`, cujo corpo padrão é vazio, e **a chamada a ele no método público `realizar`**. Acrescenta também a etapa ao tipo `EtapaComHook` e ao resultado correspondente, para identificar a recusa sem atribuí-la à selagem. Essa instalação custou editar o método template e a representação das etapas/resultados da versão de exercício; não houve extensão com zero alterações da base.

`solution/inspecao.ts` define `RitualFogoInspecionado`, que sobrescreve o novo hook e recebe uma aprovação didática na construção, e `RitualGeloComHookPadrao`, que usa o hook vazio sem sobrescrevê-lo. Esse booleano não autentica uma inspeção real nem comprova segurança de uma poção. A variante de fogo ainda fornece o encantamento obrigatório; a de gelo também. Não foram alteradas as decisões de preparação e selagem para acomodar a recusa.

`solution/hook.test.ts` verifica três caminhos e a ordem completa. `npm run solution` executa os casos recusado e aprovado, com saídas preservadas em `evidence/solution-stdout.txt`. O modelo continua síncrono e sem rollback: recusar depois de conjurar não apaga o encantamento já representado. O hook não é um agendador de etapas arbitrárias.
