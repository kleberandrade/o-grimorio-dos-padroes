# Exercício — Adiar a criação não é autorizar

Em uma variante **separada**, implemente `ProxyVirtual` com o mesmo Subject `Sala`. Receba um carregador síncrono `() => Sala`, em vez de uma sala já criada. A primeira operação deve chamar o carregador; as seguintes devem reutilizar a instância retornada.

Critérios verificáveis:

- Construir o proxy não chama o carregador nem cria uma `SalaReal` antecipadamente.
- Após a primeira `entrar()`, existe exatamente uma instância criada; após outra operação, continua uma e há duas entradas no mesmo serviço real.
- Virtualização sozinha não acrescenta autorização: um `SalaReal` sem controle próprio continua permitindo a entrada sem mandato.
- Erro no carregador é propagado e não preenche a instância guardada; uma nova operação explícita pode tentar carregar outra vez.
- Erro na operação de uma sala já carregada não descarta a instância nem dispara uma carga extra.
- Explique a intenção de proteção versus a intenção de adiar a criação.

Compare com `solution/proxy-virtual.ts` e `solution/virtual.test.ts`; execute `npm run solution`. `exercise/` fica fora da compilação da resposta oficial.

## Resposta comentada

`ProxyVirtual` guarda o resultado de uma carga bem-sucedida e delega a mesma operação. Não há callback de carregamento assíncrono, Promise, coalescência de chamadas concorrentes, invalidação ou garantia de economia medida. Uma falha de carga só é tentada outra vez quando o cliente faz uma nova chamada; não existe retentativa automática dentro da mesma operação.

O objeto é carregado antes de delegar a primeira operação. Portanto, uma primeira chamada com nome inválido ainda cria a sala, que depois rejeita a entrada pelo contrato do serviço. O exercício não promete validar o pedido antes da carga.

O carregador é uma dependência injetada e deve devolver um `Sala` válido. Receber um objeto já pronto eliminaria a parte tardia da criação; por isso o teste cria `SalaReal` efetivamente dentro do carregador e verifica a ausência de instâncias antes do uso.
