# 19 — Mediator: O Conselho das Vozes

Zora coordena um pedido local de abertura: cultivadores respondem pela inspeção, barqueiros pelas amarras e guarda pela autorização/manobra. O projeto representa essas solicitações, confirmações e efeitos por dados, sem simular fluxo de água, estabilidade de embarcação ou recuperação de carga molhada. A coordenação nova não apaga dano anterior.

## A alternativa direta primeiro

Com dois colaboradores simples e relação estável, uma chamada direta é mais clara que introduzir um conselho. `src/main.ts` começa com uma solicitação diretamente registrada. Mediator ganha função neste recorte quando a reação correta depende da etapa e do responsável, sem fazer cada colega conhecer todos os outros.

`ConselhoMediator` implementa `Mediador.notificar(Evento)`. `Barqueiros`, `Cultivadores` e `Guarda` conhecem esse contrato para comunicar decisões, sem referências entre si. O mediador conhece portas de ação desses colegas e escolhe **um destinatário e uma ação por regra**. Não retransmite toda mensagem a todos como um barramento genérico.

## Executar

Ambiente declarado e utilizado: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. `.nvmrc`, lock e configuração ESM NodeNext estrita são próprios. Não há imports de outros projetos.

Na pasta `book-23/code/19-mediator`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório:

```sh
node book-23/scripts/projetos.mjs 19 install
node book-23/scripts/projetos.mjs 19 check
node book-23/scripts/projetos.mjs 19 run
node book-23/scripts/projetos.mjs 19 solution
node book-23/scripts/projetos.mjs 19 capture
node book-23/scripts/projetos.mjs 19 verify
```

`evidence/stdout.txt` e `solution-stdout.txt` são gerados pelos programas reais, sem banners npm; não há linhas de envio acrescentadas editorialmente. `manifest.json` vincula versões/fontes/testes/saídas por SHA256. `runner-commands.json` registra os seis comandos do runner; `isolation.json` registra instalação, testes e programas numa cópia temporária só deste projeto, com comparação byte a byte das duas saídas. Tempos de teste variam; não houve benchmark. As evidências são do produtor e não atribuem aprovação humana ou auditoria independente.

## Uma composição, um pedido

`montarConselho()` cria um mediador e três colegas novos e conecta suas portas uma única vez. A ligação é feita antes das notificações; sem equipe conectada, um pedido é rejeitado. `conectar()` copia as referências de cada porta e recusa reconexão, impedindo trocar equipe enquanto se mantém o estado de uma operação.

O ciclo é deliberadamente de uso único:

1. Estado `pronto`: `Barqueiros.pedirAbertura()` produz `pedido`. O mediador entra em `aguardando-inspecao` e chama **somente** `Cultivadores.solicitarInspecao()`.
2. `Cultivadores.confirmarInspecao(true)` faz entrar em `aguardando-amarras` e chama **somente** `Barqueiros.solicitarAmarras()`.
3. `Barqueiros.confirmarAmarras(true)` faz entrar em `aguardando-autorizacao` e chama **somente** `Guarda.solicitarAutorizacao()`.
4. `Guarda.confirmarAutorizacao(true)` chama `Guarda.abrir()` e só entra em `aberto` depois de a ação retornar normalmente.

As ações de solicitação apenas incrementam seu contador no colega; não geram confirmação automática. Confirmações são chamadas explícitas posteriores, de responsáveis distintos no exemplo. Confirmação negativa na etapa correspondente encerra como `recusado`; não solicita a próxima ação. Um evento fora da etapa, duplicado, precoce ou posterior ao encerramento é rejeitado sem novos despachos. Os três valores de confirmação precisam ser booleanos em execução; strings truthy e números não contam como confirmação.

`Resultado` tem `status`, `estado` e `motivo`. `processado` significa que o evento válido foi tratado: uma negativa pode ser processada e terminar `recusado`. `rejeitado` significa que o evento não podia ser tratado naquele contexto. `falhou` significa que uma ação dirigida lançou erro. Esses estados não são autenticação ou confirmação de segurança física.

Um segundo pedido exige **nova composição completa**, com novo mediador e novos colegas. O contexto anterior não tem reset ou troca de pedido. Seus colegas continuam ligados à operação antiga; confirmações antigas não fazem avançar a nova composição. Não há correlação distribuída entre pedidos, rotação de identificadores ou fila de operações concorrentes.

## Falha parcial, repetição e reentrância

O mediador registra cada despacho com destinatário, ação e status. Erro síncrono de qualquer ação encerra como `falhou`, sem despachar etapas posteriores e sem retentativa automática. A mensagem de `Error` é copiada quando legível; há fallback para valor lançado sem mensagem ou leitura de mensagem que falhe. A exceção é convertida em resultado de falha, sem preservar sua identidade como exceção relançada.

`Guarda(true)` na montagem de teste simula falha **após incrementar o contador de acionamentos** e antes de marcar abertura. A tentativa permanece observável, `aberta` fica falsa e o conselho não anuncia `aberto`. Nenhuma solicitação ou efeito anterior é revertido. Uma porta externa poderia falhar depois de produzir outro efeito parcial; o mediador não descobre nem desfaz esse efeito por magia. O estado `falhou` não é um certificado de quanto uma comporta física se moveu.

Durante o despacho de uma ação, uma notificação reentrante ao conselho é rejeitada. O bloqueio é liberado em `finally`; a ação solicitada deve retornar antes de a confirmação ser recebida por chamada posterior. Isso evita avançar o protocolo dentro de um callback de solicitação. Não há fila de notificações aninhadas ou controle de trabalho arbitrariamente bloqueante.

A repetição não é idempotência geral: eventos já consumidos retornam rejeição em vez de repetir o sucesso. Estados terminais não aceitam nova tentativa; criar um novo contexto é uma decisão explícita fora deste ciclo, sem promessa de que isso seja seguro para um serviço real após resultado incerto.

As portas são **síncronas** neste contrato. Um retorno `void` não impede toda função async em TypeScript; o mediador não espera Promises nem trata rejeições delas. Uma implementação que devolve trabalho assíncrono viola esse contrato local; não interprete retorno normal como conclusão assíncrona.

## Encapsulamento e custos

Campos `#` protegem o estado das instâncias em JavaScript, enquanto interfaces e `readonly` orientam a compilação. Uma interface de evento não autentica o remetente: código que possui o mediador pode chamar `notificar` diretamente. Quem possui a guarda também pode chamar seu método público `abrir` e ignorar a coordenação; um teste demonstra esse limite. As pré-condições são regras do **caminho mediado**, não uma fronteira de segurança física ou distribuída.

Resultados, snapshots, a lista de despachos e seus itens são congelados. Snapshots copiam a lista e conservam apenas campos escalares declarados. A montagem e a equipe copiam/congelam seus recipientes de referências, sem congelar o estado dos colegas, que precisa mudar. Isso não clona portas, funções ou closures, nem protege contra código hostil que altere métodos/protótipos/dependências.

O ciclo fornece no máximo quatro despachos, portanto esse histórico de ações é limitado por sua própria política de uso único. Snapshots copiam os registros existentes; o mediador mantém referências às três portas. Adicionar muitas regras pode aumentar acoplamento e custo de manutenção, mesmo sem aumentar muito a execução deste exemplo. O mediador conhece as regras da cooperação local; concentrar distribuição de água, território, tributação e toda política do conselho faria dele um objeto com responsabilidades excessivas.

## Exercício e relações

`exercise/README.md` pede separar uma política de cotas do mecanismo de abertura. `solution/cotas.ts` implementa uma política pequena e explícita de prioridade por ordem; a composição a chama fora do mediador. O plano resultante não confirma inspeção, não amarra carga e não autoriza abertura. A solução é uma recusa fundamentada de acrescentar essa nova responsabilidade à base, sem fingir que um método de distribuição já existia no projeto principal.

Observer distribui uma notícia a interessados que reagem por conta própria. Aqui as regras escolhem destinatário/ação de acordo com pré-condições. Facade oferece uma entrada mais simples para um conjunto de serviços; Mediator organiza a interação entre colegas que notificam o contrato comum. Uma composição pode usar intenções de ambos; não há proibição absoluta de chamadas diretas ou regra de que qualquer coordenador seja um Mediator.

Um barramento de mensagens pode ser parte de uma implementação, mas retransmitir a todos não demonstra por si só esta coordenação seletiva. Não há broker, rede, persistência ou framework externo demonstrado. Citações não verificadas e afirmações genéricas de harmonia da fonte não são usadas como evidência.

## Arquivos

`src/contratos.ts`: eventos, resultados e portas. `src/conselho.ts`: regras e despachos. `src/colegas.ts`: colegas com referência ao contrato do mediador. `src/montagem.ts`: raiz de composição. `src/main.ts`: saída real da alternativa direta e do protocolo. `test/mediator.test.ts`: destinatários, ordem, recusas, falhas e limites. `solution/`: política separada, exemplo e testes. `diagram.mmd`: somente a base, sem a política do exercício.
