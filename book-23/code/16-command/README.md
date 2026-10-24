# 16 — Command: O Grimório de Ordens

Davi precisa distinguir uma reserva cancelável de minério já consumido na forja. Este projeto modela um estoque local, reservas por identidade e um invocador com histórico limitado. O programa principal separa 12 unidades em parcelas de 4 e 8: quatro são forjadas por uma operação distinta; oito são reservadas e depois liberadas pelo comando. Desfazer a reserva mantém as quatro forjadas.

## A solução direta primeiro

Se basta executar uma operação imediatamente, chamar `estoque.reservar(quantidade)` é legítimo. O cliente guarda o token se precisar cancelar essa reserva depois. `src/main.ts` demonstra a chamada direta para a parcela do forno. Não há obrigação de envolver cada método num comando.

Quando a solicitação precisa existir antes da execução e integrar um histórico uniforme, `ComandoReservar` encapsula receptor e quantidade. Construí-lo não altera estoque; `Invocador.executar(comando)` dispara a operação e só depois registra uma execução bem-sucedida. O invocador conhece `Comando`, sem conhecer a classe do estoque. O cliente que monta os objetos **conhece o receptor** e o entrega ao comando. Não é necessário esconder essa relação para usar Command.

## Executar

Ambiente declarado e utilizado: Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**. Há `.nvmrc`, lock próprio e compilação ESM NodeNext estrita, sem importar outro projeto.

Na pasta `book-23/code/16-command`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
npm run solution
```

Na raiz do repositório:

```sh
node book-23/scripts/projetos.mjs 16 install
node book-23/scripts/projetos.mjs 16 check
node book-23/scripts/projetos.mjs 16 run
node book-23/scripts/projetos.mjs 16 solution
node book-23/scripts/projetos.mjs 16 capture
node book-23/scripts/projetos.mjs 16 verify
```

`evidence/stdout.txt` e `solution-stdout.txt` contêm as saídas dos programas, sem os banners npm. `manifest.json` vincula fontes, versões, testes e saídas por SHA256. `runner-commands.json` registra a execução dos seis comandos do runner. `isolation.json` registra instalação/testes/programas numa cópia temporária só deste projeto e a comparação byte a byte dos stdout. Essas são verificações do produtor; não atribuem auditoria independente ou aprovação humana.

## Receptor e reversão suportada

`EstoqueMinerio(inicial)` recebe um inteiro seguro não negativo. Quantidades de reserva e forja devem ser inteiros seguros **positivos**; NaN, infinito, frações, zero e negativos são recusados. Não há conversão de unidades físicas: são unidades indivisíveis do modelo.

`reservar(quantidade)` reduz disponível e cria um token congelado `Reserva`. O receptor conserva o restante dessa reserva num `Map` privado. O token é reconhecido por identidade e somente no estoque de origem; copiar seus campos não cria uma reserva. Esse mecanismo evita confusão entre reservas do modelo, sem autenticar pessoas ou criar uma fronteira de segurança.

`cancelar(reserva)` aceita apenas uma reserva ativa **integralmente intacta**. Libera sua quantidade e remove essa reserva, sem reinstalar um snapshot global. `forjar(reserva, quantidade)` consome parte ou toda a reserva e aumenta `forjado`; é uma operação distinta, sem inversa neste projeto. Consumo parcial faz o cancelamento integral ser recusado; consumo total encerra a reserva e também impede cancelá-la. As recusas não mudam o estado. Não existe uma operação de liberação parcial do remanescente de uma reserva consumida; esta é uma limitação deliberada do recorte. Parcelas que precisam de destinos independentes devem ser reservadas separadamente antes de consumir.

`snapshot()` expõe disponível, reservado, forjado e uma lista de quantidades iniciais/restantes das reservas ativas. Nos métodos fornecidos, disponível + reservado + forjado conserva o estoque inicial. Isso não modela perdas, reposição, recursos distribuídos ou atomicidade do mundo físico.

## Comando, histórico e repetição

`ComandoReservar` guarda quantidade, receptor, token e snapshot anterior para consulta. O snapshot é proveniência, **não é restaurado indiscriminadamente** ao desfazer. A operação inversa cancela exclusivamente o token daquela execução, preservando reservas e forjas posteriores em outras parcelas.

Estados do comando:

- `novo`: pode executar. Se faltar estoque, lança erro e permanece novo; uma tentativa posterior pode executar se houver disponibilidade.
- `executado`: repetir execução é erro, sem nova reserva. Pode desfazer se o receptor ainda aceitar o cancelamento daquela reserva.
- `desfeito`: não executa nem desfaz novamente. Uma nova solicitação exige outra instância; não há redo implementado.

Isso é uma política de uso único local, não uma promessa de idempotência: chamadas repetidas retornam erro em vez de repetir o sucesso anterior. Instâncias diferentes podem solicitar a mesma quantidade, causando efeitos distintos.

`Invocador(limite)` exige limite inteiro seguro positivo. `desfazerUltimo()` usa ordem LIFO, retorna `false` para histórico vazio e `true` quando a inversa do topo conclui. A entrada só é removida **depois** do sucesso. Se o cancelamento falhar porque a reserva foi consumida ou cancelada externamente, o erro propaga, a entrada permanece e não se salta para ordens mais antigas. Não há comando para apagar esse conflito ou recuperar metal; o operador precisa reconhecê-lo fora deste recorte.

Ao ultrapassar o limite, o invocador descarta a entrada mais antiga. Seu efeito continua no receptor e perde-se o acesso àquela inversa **por esse histórico**. Referências ao comando conservadas pelo cliente ainda existem; a poda não revoga essas referências nem é descarte automático de recursos. O cliente deve coordenar acesso a comandos e receptor: chamar seus métodos diretamente pode tornar entradas obsoletas, que serão recusadas se já não satisfizerem suas precondições. Os testes incluem consumo externo, trabalho posterior e tentativa de usar um comando antigo.

Falha de `executar()` não entra no histórico. Para os comandos de reserva fornecidos, falta de estoque é detectada antes da mutação. Uma implementação arbitrária de `Comando` pode realizar um efeito e depois lançar erro: o invocador não dispõe de uma transação universal para revertê-la ou registrar automaticamente o que ocorreu. O contrato síncrono tampouco garante comportamento de comandos que retornem trabalho assíncrono sem aguardá-lo.

## Dados e custos

Campos `#` protegem estado de instância em JavaScript. `readonly` e interfaces ajudam na compilação, sem impedir sozinhos mutação em execução. Tokens, snapshots, listas internas dos snapshots e seus itens são congelados; o histórico devolve uma lista nova de descrições congeladas, sem expor comandos. Cópias cobrem estes dados escalares e listas, sem promessa de clonagem profunda genérica, congelamento de protótipos ou proteção contra código arbitrário que altere dependências.

A pilha guarda até o limite de referências, e o descarte com `shift()` pode deslocar suas entradas. Descrições e listagens são copiadas; snapshots percorrem reservas ativas. O snapshot anterior de cada comando pode ampliar o custo de memória conforme o número de reservas e o tamanho do histórico. O mapa do receptor mantém reservas ativas independentemente da poda do histórico. Não houve benchmark nem afirmação de ganho de desempenho.

## Compensação, evento e Memento

O exercício usa `PortaAvisos` com `AvisosSimulados`, exclusivamente em memória. Emitir um aviso cria um registro; compensar acrescenta outro, vinculado ao original, sem apagar o primeiro. A operação chamada `desfazer()` pelo contrato do comando representa **compensação**, cuja semântica é distinta do cancelamento exato da reserva. Ela não remove a experiência de um destinatário. Não há rede ou destinatário real neste projeto.

Na simulação, a falha programada ocorre antes de registrar a compensação; o histórico conserva a entrada para uma tentativa manual posterior. Uma porta real pode falhar depois de produzir efeito, deixando resultado incerto: repetir pode duplicar ações. Não são garantidos exatamente uma vez, entrega, persistência, distribuição ou deduplicação entre instâncias. O comando só evita repetição da própria instância quando o sucesso é conhecido localmente.

Command representa uma solicitação executável e pode guardar informação para uma inversa específica. Um evento registra algo que ocorreu; não é automaticamente uma solicitação nem uma operação reversível. Uma fila pode transportar comandos, mas uma fila ou evento não se torna Command GoF apenas por esse nome. Este invocador não implementa fila persistente ou replay.

Memento conserva estado para restauração pelo objeto responsável. Aqui a quantidade e o token bastam à inversa local; restaurar o estoque inteiro ao snapshot anterior apagaria trabalho posterior. Captura e inversa podem coexistir em outros projetos, mas têm intenções e custos diferentes. Nenhum dos padrões torna uma forja física reversível.

## Arquivos

`src/estoque.ts`: receptor e snapshots. `src/comando.ts`: contrato e comando de reserva. `src/invocador.ts`: histórico delimitado. `src/main.ts`: composição/alternativa direta e demonstração. `test/command.test.ts`: efeitos, falhas, limites e invariantes. `diagram.mmd`: relações da base. `exercise/README.md` e `solution/`: efeito externo simulado, compensação e testes separados.
