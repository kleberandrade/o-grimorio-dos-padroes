# 18 — Observer: Os Arautos do Reino

O oráculo anuncia uma rajada local em Valharth. Uma casa aposentada ainda recebe um chamado, o sino falha, o escriba publica e o salão muda seu estado para aberto. Cada reação mantém seus próprios dados; o relatório registra callbacks concluídos ou falhos. Avisar não executa automaticamente uma evacuação nem certifica que um serviço físico funcionou.

## A alternativa direta primeiro

Para poucos interessados estáveis, chamar funções diretamente é legítimo e deixa as dependências visíveis. `src/main.ts` começa assim, registrando um aviso por chamada direta. Observer ajuda quando interessados entram e saem durante o ciclo de vida, sem o emissor codificar a reação particular de cada um.

`Oraculo` é o Subject; os callbacks inscritos são Observers. O Subject conhece a operação de notificação, enquanto cada callback decide sua reação. Não é necessário criar uma classe para cada reação: funções e closures bastam neste exemplo. Retirar uma inscrição é parte do contrato, não um detalhe opcional do encerramento de turno.

## Executar

Versões declaradas e utilizadas: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. `.nvmrc` e lock são próprios; compilação ESM NodeNext estrita, sem imports de outro projeto.

Na pasta `book-23/code/18-observer`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório:

```sh
node book-23/scripts/projetos.mjs 18 install
node book-23/scripts/projetos.mjs 18 check
node book-23/scripts/projetos.mjs 18 run
node book-23/scripts/projetos.mjs 18 solution
node book-23/scripts/projetos.mjs 18 capture
node book-23/scripts/projetos.mjs 18 verify
```

`evidence/manifest.json` vincula versões, fontes, testes e as duas saídas funcionais por SHA256. `stdout.txt` e `solution-stdout.txt` são saídas reais sem banners npm. `runner-commands.json` registra os seis comandos do runner. `isolation.json` registra instalação/testes/programas numa cópia temporária só deste projeto e a comparação byte a byte das duas saídas. Tempos dos testes podem variar. Evidências do produtor não equivalem a auditoria independente ou aprovação humana.

## Inscrição, ordem e snapshot

`inscrever(nome, observar)` exige nome não vazio e função. O nome é normalizado por `trim` e serve para apresentação; nomes iguais são permitidos. A duplicata é definida pela **identidade da mesma função atualmente inscrita**, independentemente do nome, e é recusada. Duas closures diferentes, mesmo com corpos semelhantes, são inscrições distintas.

A função devolvida, `Desligar`, remove somente aquela inscrição e retorna `true` se a removeu; se já não for a inscrição ativa correspondente, retorna `false`. Repeti-la não causa efeito adicional. Depois de remover, a mesma função pode ser inscrita novamente. O handle antigo compara a identidade do registro de inscrição e **não remove a nova inscrição**, mesmo que a função seja a mesma.

`emitir({ mensagem, local })` exige duas strings não vazias e copia/congela esses campos normalizados. Antes de chamar qualquer observador, copia a lista atual de inscrições em sua ordem de entrada. Uma rodada tem exatamente esses destinatários, nessa ordem:

- Remover uma inscrição durante callback afeta a próxima rodada. Se ainda não foi chamado, aquele destinatário continua na rodada já fixada.
- Incluir durante callback só entra na próxima rodada, na posição de sua nova inscrição.
- Remover e reinscrever durante callback não duplica a rodada: o registro antigo permanece no snapshot atual, e o novo vale para a próxima.

`numeroInscricoes()` mostra o número ativo, que pode diferir do tamanho de uma rodada em curso. Remover alguém não apaga avisos já processados nem desfaz seus efeitos. No programa, a casa aposentada se desliga ao receber a primeira mensagem; a segunda não a inclui.

## Falhas síncronas e reentrância

Cada callback é chamado isoladamente dentro de `try/catch`. Uma exceção síncrona gera uma reação `falhou`, sem impedir os próximos callbacks. A mensagem de `Error` é preservada quando pode ser lida como string. Outro valor lançado recebe `"Falha sem mensagem de Error."`; se a própria leitura da mensagem falhar, usa-se `"Falha ao ler mensagem do erro."`, sem chamar conversões arbitrárias de objeto para texto.

O relatório contém o aviso copiado e as reações em ordem. `concluiu` significa **o callback retornou normalmente**, não que uma pessoa recebeu a notícia ou que uma evacuação ocorreu. Um callback que captura um erro ou ignora um relatório interno com falhas também pode retornar normalmente. O relatório não infere sucesso transitivo de operações internas. Efeitos anteriores a uma exceção não são revertidos; não há rollback, retentativa automática ou histórico persistente.

Uma nova `emitir()` no **mesmo oráculo enquanto sua rodada ainda está em curso** é recusada imediatamente, antes de iniciar outra rodada. Não há fila de avisos aninhados. Se o observador não captura essa recusa, ela entra como falha daquele callback e os seguintes continuam. Ao finalizar a rodada, o bloqueio é liberado em `finally`, e uma emissão posterior é permitida. Um ciclo síncrono A → B → A termina quando A é chamado novamente ainda ativo; os testes verificam esse caso. Isso não interrompe um callback que entre, por conta própria, em trabalho infinito ou bloqueante.

O contrato exige callbacks **síncronos**. O tipo `(aviso) => void` não proíbe estaticamente toda função `async`: TypeScript pode aceitar uma função que devolve Promise nesse lugar. A implementação **não espera Promises e não trata suas rejeições**; uma Promise devolvida é ignorada. Não use este Subject como emissor assíncrono nem interprete `concluiu` como conclusão assíncrona. Não há teste com rejeição não tratada ou promessa de entrega distribuída.

## Dados, ciclo de vida e custos

O aviso tem somente duas strings, copiadas no novo objeto; esse objeto, o relatório, sua lista e os itens da lista são congelados. Não há cópia profunda genérica nem congelamento de estado fechado pelos callbacks. Esses callbacks precisam poder atualizar suas próprias publicações, contadores ou estado de abrigo.

Campos `#` mantêm mapa e bloqueio privados em execução. Interfaces e `readonly` ajudam na compilação, sem constituir validação universal de entrada ou barreira de segurança. O contrato cobre os dados declarados e as implementações fornecidas, sem proteção prometida contra código hostil, adulteração de protótipos/dependências ou serviços externos.

Inscrições retêm funções e, por consequência, podem manter vivos objetos alcançados por suas closures enquanto forem referenciadas. Encerrar o turno exige chamar unsubscribe ou o controlador do exercício. O handle devolvido também fecha sobre referências: removê-lo do mapa não apaga outras referências guardadas pelo cliente. Uma emissão copia a lista de N inscrições e produz até N itens de relatório, além do tempo arbitrário gasto nos callbacks. Uma reação lenta bloqueia as seguintes porque a execução é síncrona. Não houve benchmark ou promessa de desempenho.

## Exercício e comparações

`exercise/README.md` acrescenta `EscopoDeInscricoes`, um pequeno responsável pelo conjunto de vínculos de um turno. Não muda as regras do Subject: encerrar dentro de um callback remove vínculos para a próxima emissão, enquanto o snapshot atual continua válido. Os testes verificam encerramento repetido, vínculo externo preservado, handle antigo e reentrância.

Observer organiza dependentes que reagem à notificação do Subject. Publicação/assinatura pode usar um intermediário, tópicos e contratos de entrega diferentes; um broker pode desacoplar localização e tempo, mas não garante por si só entrega ou exatamente uma vez. Este mapa local de callbacks não é um broker, não possui rede, persistência, tópicos, confirmação ou replay. A semelhança entre inscrição/notificação não torna os termos automaticamente intercambiáveis.

Mediator concentra regras de interação entre participantes para coordenar decisões. Aqui o Subject distribui a mesma notícia a reações independentes; não decide uma sequência de inspeção, autorização e abertura entre elas. Se o emissor passar a acumular essas políticas, será preciso reavaliar suas responsabilidades. Não há API de framework externo ou emitter nativo demonstrada, nem equivalência automática entre tais APIs e Observer GoF. As citações históricas não verificadas da fonte autoral não são reproduzidas como autoridade.

## Arquivos

`src/oraculo.ts`: Subject, callbacks e relatórios. `src/main.ts`: alternativa direta e reações com estado local. `test/observer.test.ts`: ordem, duplicata, snapshot, falhas, reentrância e cópias. `solution/escopo.ts`: controlador de ciclo de vida adicional, com programa e testes próprios. `diagram.mmd`: relações da base, sem incluir a classe da solução.
