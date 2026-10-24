# 20 — Chain of Responsibility: O Caminho das Correntes Invisíveis

Alda formula um pedido de passagem pela galeria interna. Guarda e Conselheira não decidem essa exceção; Regência a nega fundamentadamente. A passagem pela Porta dos Carros é um **outro pedido**, que a Guarda resolve sem subir pelos demais elos. O projeto representa a triagem de dados, sem simular remédio, validade, cisterna ou segurança estrutural. O nome Alda aplica `../../docs/adendo-nomes-personagens-01.md`; o planejamento histórico permanece preservado.

## A alternativa direta primeiro

Se o responsável já é conhecido, chamar seu método diretamente pode ser suficiente. `src/main.ts` começa com `Guarda.decidir()` para uma passagem pela Porta dos Carros. Isso não precisa percorrer uma cadeia inteira. O cliente de uma entrada externa ainda precisa validar os dados; no exemplo direto o pedido já é construído pelo programa com o tipo declarado.

A cadeia é útil quando o cliente encaminha a solicitação a uma sequência configurada e cada handler pode resolver, negar ou declarar que não é responsável. O **primeiro resultado terminal** encerra a avaliação. Isso não torna a hierarquia justa nem garante que a ordem escolhida seja boa; a ordem é parte da política.

## Estrutura efetivamente implementada

`Handler` é um contrato com `nome` e `decidir(pedido): Decisao`. `Guarda`, `Conselheira` e `Regencia` implementam suas regras locais. **`Cadeia` controla a passagem pela lista finita de handlers**, na ordem recebida. Não há campos `next` nem setters de próximo em cada handler. Essa é uma variante da cadeia por coleção ordenada; o diagrama mostra a coleção e o despacho real, sem inventar enlaces entre os objetos.

Se um handler devolve `naoTratado`, `Cadeia` continua ao próximo. Se devolve `tratado` ou `negado`, ela retorna imediatamente e não chama os posteriores. Uma cadeia vazia ou cujo último handler também não trata devolve `naoTratado`, responsável nulo e percurso correspondente. Não é um pipeline que executa todas as etapas.

## Executar

Versões declaradas e utilizadas: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. Lock, `.nvmrc`, `.gitignore` e configuração ESM NodeNext estrita são próprios; nenhum outro projeto é importado.

Na pasta `book-23/code/20-chain-of-responsibility`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório:

```sh
node book-23/scripts/projetos.mjs 20 install
node book-23/scripts/projetos.mjs 20 check
node book-23/scripts/projetos.mjs 20 run
node book-23/scripts/projetos.mjs 20 solution
node book-23/scripts/projetos.mjs 20 capture
node book-23/scripts/projetos.mjs 20 verify
```

`evidence/manifest.json` vincula fontes, versões, testes e as saídas por SHA256. `stdout.txt` e `solution-stdout.txt` vêm dos programas reais, sem banners npm. `runner-commands.json` registra os seis comandos do runner; `isolation.json` registra instalação/testes/programas numa cópia temporária só deste projeto e comparação byte a byte dos stdout. Tempos de testes variam; não houve benchmark. São evidências do produtor, sem atribuição de auditoria independente ou aprovação humana.

## Pedidos e decisões

`Pedido` tem `solicitante`, `prioridade: normal|urgente` e um tipo discriminado:

- `passagem`: rota `galeria-interna` ou `porta-dos-carros`.
- `provisoes`: quantidade inteira positiva segura.
- `audiencia`: assunto textual não vazio; não há handler responsável por esse tipo na montagem principal, para demonstrar fim sem tratador.

`normalizarPedido()` valida os campos declarados, normaliza textos com `trim`, copia os campos da variante e congela o novo objeto. Tipo, prioridade e rota desconhecidos, textos vazios e quantidades inválidas são **erros de dados**, que lançam exceção antes de chamar os handlers. Isso difere de uma negativa de negócio. O contrato não valida toda estrutura arbitrária ou objeto hostil vindo de JavaScript sem tipos.

Nenhuma palavra no nome ou assunto é usada como detector de invasão. `solicitante` é informação declarada, sem prova de identidade. O campo `prioridade` também não autentica urgência. A cadeia não é uma fronteira de segurança ou serviço real de autorização.

As regras da base são:

- Guarda trata passagem pela Porta dos Carros; encaminha os demais pedidos.
- Conselheira trata provisões até cinco unidades e nega acima desse limite local; encaminha outros tipos.
- Regência nega passagem pela galeria interna por interdição declarada no modelo; encaminha os demais tipos.

Cada resposta local contém `status` e `motivo`. O resultado final acrescenta `responsavel` e `percurso`, com nome/decisão de cada handler realmente chamado. O percurso pertence **àquela avaliação**, sem ser um histórico global persistente. `naoTratado` no final é um desfecho válido e explícito, não uma exceção nem uma autorização silenciosa.

## Configuração, repetição, erros e ciclo de vida

A montagem copia/congela a lista de entradas e captura nome e função vinculada de cada handler. Mutar a lista original ou substituir depois o nome/método do objeto não reconfigura essa cadeia. Referências duplicadas ao mesmo handler são recusadas na montagem. Objetos diferentes com o mesmo nome são permitidos; nome não é identidade nem autenticação.

Não existe API para reordenar ou acrescentar elos numa instância em uso; outra configuração requer uma nova `Cadeia`. Como não existem enlaces mutáveis `next` nesta variante, a lista configurada não cria ciclos de ponteiros. Isso não congela genericamente o estado ou as closures de extensões, nem impede código arbitrário de fazer trabalho infinito.

Reentrar em `processar()` na mesma cadeia enquanto ela já avalia um pedido lança erro imediatamente. O bloqueio é liberado por `finally`; uma chamada posterior pode avaliar normalmente. A avaliação é **síncrona**, sem espera de Promise, fila, concorrência distribuída ou tratamento de rejeições assíncronas.

Erros lançados por handlers são propagados; não são convertidos em `negado` ou `naoTratado`. Status local incompatível ou motivo vazio também lançam erro de contrato. Se houver erro, não se produz um resultado final com percurso completo. Efeitos que a extensão realizou antes do erro podem permanecer: não há rollback, retentativa ou compensação automática. Os handlers fornecidos só calculam decisões e não debitam estoque nem abrem portas físicas.

Repetir um pedido é uma nova avaliação. A base devolve decisões equivalentes porque suas regras são estáveis, mas handlers com efeitos podem agir novamente; a cadeia não fornece idempotência, deduplicação ou uso único. Guardar um resultado anterior não impede outra solicitação. O novo pedido de rota alternativa não apaga a negativa anterior que o cliente tenha conservado.

## Cópias e custos

Os campos dos pedidos são escalares. Pedido normalizado, resultado, lista de percurso e seus itens são congelados; status e motivo da decisão local são copiados para o resultado. Isso não promete clonagem profunda genérica de recursos, funções ou objetos de extensão. Campos `#` protegem lista/bloqueio em execução; `readonly` e interfaces fornecem verificações estáticas, sem autenticar cliente ou tornar o sistema seguro contra código hostil que altere protótipos/dependências.

Construir a cadeia copia e vincula N entradas. Uma avaliação visita K handlers até o primeiro terminal, com K menor ou igual a N, e cria até K itens no percurso; soma-se o trabalho arbitrário dos handlers e a normalização textual. A ordem pode alterar resultado, tempo e quem nunca será chamado. Não há vantagem de desempenho universal ou prazo de liberação de referências. A instância mantém referências às funções/objetos capturados enquanto ela própria estiver alcançável.

## Exercício e comparações

O exercício adiciona `PostoUrgente` para **provisões urgentes até dez unidades**. Antes da Conselheira, ele trata um pedido de oito; depois dela, a negativa pelo limite de cinco encerra o percurso antes que o posto seja consultado. Essa é uma escolha política do modelo e deve ser examinada, não uma recomendação de que urgência sempre deva vencer qualquer regra. O novo elo não decide passagem e não revoga interdição da galeria.

Decorator compõe objetos da mesma interface para acrescentar responsabilidades ou transformar resultados. Aqui a intenção é selecionar quem decide e interromper quando alguém resolve ou nega. Um pipeline pode executar todas as etapas, enquanto esta cadeia explicitamente não faz isso; outros pipelines têm seus próprios contratos de interrupção. Não se conclui que toda API de middleware seja automaticamente Chain of Responsibility GoF. Nenhuma API externa é demonstrada ou usada como autoridade neste projeto.

## Arquivos

`src/contratos.ts`: pedidos, decisões e validação. `src/handlers.ts`: três handlers da base. `src/cadeia.ts`: montagem imutável e despacho até decisão terminal. `src/main.ts`: exemplo real com Alda. `test/chain.test.ts`: interrupção, fim, dados, configuração, reentrância e erros. `solution/`: novo elo, programa e testes. `diagram.mmd`: somente estrutura real da base.
