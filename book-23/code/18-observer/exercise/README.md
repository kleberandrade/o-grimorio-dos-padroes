# Exercício — Encerrar os vínculos de um turno

Acrescente `EscopoDeInscricoes`, que recebe as inscrições feitas por um turno e encerra somente esse conjunto. Use o `Oraculo` existente, sem alterar sua política de snapshot ou habilitar chamadas reentrantes.

Critérios:

1. `inscrever(oraculo,nome,callback)` deve guardar o unsubscribe devolvido pelo Subject e também devolvê-lo ao cliente.
2. `encerrar()` remove os vínculos ainda ativos desse escopo e devolve quantos removeu. Uma segunda chamada retorna zero. Depois de encerrado, novas inscrições pelo mesmo escopo são recusadas.
3. Inscrições externas ao turno permanecem.
4. Encerrar dentro de callback mantém os destinatários da rodada corrente, mas os remove da próxima.
5. Um handle guardado pelo turno antigo não pode apagar uma reinscrição pertencente a outro turno.
6. A política de reentrância da base continua valendo. Teste uma reação que tenta emitir novamente e um encerramento posterior na mesma rodada.

## Resposta comentada

`solution/escopo.ts` compõe funções `Desligar`, sem precisar ler o mapa privado do Subject ou herdar dele. Antes de executar a limpeza, marca o escopo como encerrado e retira a lista interna de handles. Com a implementação de `Oraculo` fornecida, esses handles não chamam observadores; apenas tentam remover sua própria inscrição. Se uma referência antiga já tiver sido removida ou substituída por reinscrição, retorna `false` e não conta como nova remoção.

A base não precisou mudar; a solução acrescenta o controlador de ciclo de vida, não outra implementação do Observer. O uso inclui a responsabilidade de chamar `encerrar()` no fim do turno: não existe encerramento automático por tempo ou coleta de lixo. O retorno zero repetido é a política idempotente desta limpeza, sem alegar que os callbacks ou a aplicação inteira sejam idempotentes.

`solution/main.ts` encerra o escopo durante a primeira reação; a segunda ainda escreve o aviso corrente. A emissão seguinte não chama essas reações. `solution/escopo.test.ts` verifica também uma inscrição externa, uma reinscrição em outro turno e reentrância recusada. Tudo é síncrono e local, sem broker, rede, persistência ou confirmação de entrega.

A alternativa para um único vínculo é guardar e chamar diretamente o unsubscribe, sem classe de escopo. Um broker exigiria outro contrato de inscrição, entrega, falha e encerramento; esta solução não demonstra essas garantias.
