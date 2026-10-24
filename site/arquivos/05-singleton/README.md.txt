# 05 — Singleton: Registro com ciclo de vida controlado

Uma casa de controle usa um registro de ordens. A composição escolhe se cria uma instância explícita ou obtém uma instância compartilhada da API do módulo. Os serviços recebem `Registro` por injeção; suas preferências de turno pertencem a cada equipe.

## Ambiente e execução

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, dependências fixadas por lock. Dentro deste projeto:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books:

```sh
node book-23/scripts/projetos.mjs 05 install
node book-23/scripts/projetos.mjs 05 check
node book-23/scripts/projetos.mjs 05 capture
node book-23/scripts/projetos.mjs 05 verify
```

O build limpa `dist` e compila módulos ES2022/ESM com TypeScript estrito. Testes usam `node:test` sobre JavaScript compilado. Os Workers executam arquivos emitidos locais, não TypeScript cru. Não há importações de outros capítulos. `exercise/` fica fora do build oficial.

## Papéis e arquivos

- `src/contratos.ts`: contrato `Registro` e dados de ordens.
- `src/registro.ts`: `RegistroEmMemoria`, sem restrição de construtor; aceita `new` para ciclos locais e testes.
- `src/equipe.ts`: serviço com dependência explícita e preferência de turno por instância.
- `src/modulo-compartilhado.ts`: armazenamento privado ao módulo e acesso síncrono à referência compartilhada.
- `src/composicao.ts`: duas equipes recebem o registro escolhido pelo chamador.
- `src/preferencia-compartilhada.ts`: contraprova isolada do problema de compartilhar preferências mutáveis.
- `src/sonda-worker.ts` e `src/contextos.ts`: outro contexto executa o mesmo módulo e comunica contagens por mensagem.
- `src/main.ts`: alternativa simples primeiro, identidade da API, preferências e fronteira entre contextos.
- `test/`: identidade, substituição, isolamento, histórico, falhas e dois Workers.
- `solution/`: raiz que preserva o ciclo compartilhado padrão e aceita substituição explícita.
- `diagram.mmd`: relações editáveis; caixas com estereótipo `module` representam arquivos de módulo, não classes inexistentes.
- `evidence/`: stdout real, testes, manifesto e execução numa cópia isolada.

## O que é único aqui

`obterRegistroCompartilhado()` mantém uma instância de `RegistroEmMemoria` na variável do módulo. Chamadas que usam a mesma avaliação desse módulo no mesmo contexto devolvem a mesma referência. É a implementação por módulo de um ciclo singleton e de seu ponto de acesso. A classe `RegistroEmMemoria` continua construtível; não se afirma que só um objeto dessa classe possa existir.

O getter é síncrono e não suspende entre consultar, criar e devolver a instância. Não há corrida assíncrona reproduzida, mutex ou inicialização de rede neste projeto. Uma futura inicialização com `await` precisaria de uma política própria para chamadas simultâneas, falhas e tentativas; não é uma feature escondida desta implementação.

A unicidade da API não abrange todo o processo de implantação, máquinas, processos ou todos os contextos JavaScript. O teste executa dois Workers reais no Node 26.10.0: cada Worker observa registro inicialmente vazio, acrescenta uma ordem e obtém a mesma referência em suas próprias chamadas. O histórico do pai não muda. A demonstração principal preserva suas duas ordens enquanto outro Worker registra apenas uma em seu contexto. Nenhuma referência de objeto é comparada entre heaps; comparamos identidade dentro de cada contexto e resultados enviados por mensagem.

Não há teste de processos separados, outros realms ou cópias de módulos por URLs distintas; não prometemos coordenação entre eles. A política deve ser reconciliada com o carregador e a implantação efetivos. O projeto não impõe unicidade distribuída.

## Estado de negócio e dependência

O registro de ordens compartilhado não contém o turno preferido de todas as equipes. `EquipeDeComportas.definirTurno()` afeta só aquela instância; ordens anteriores são valores congelados e preservam o turno de emissão. A contraprova usa deliberadamente duas referências ao mesmo objeto de preferências e mostra a contaminação. Esse cenário é criado localmente a cada chamada e não altera a instância padrão; ilustra uma falha de compartilhamento que pode ocorrer tanto com Singleton quanto com injeção mal composta.

O serviço não importa o provedor do módulo. A raiz decide o ciclo de vida e pode continuar injetando um singleton. Injeção torna a dependência explícita e substituível no serviço; não obriga a criar uma nova instância a cada uso e não muda sozinha a escolha de ciclo de vida. `new RegistroEmMemoria()` na raiz é suficiente quando não é necessária uma API global de acesso.

Os testes de comportamento criam registros novos ou um substituto local por caso. Os únicos testes que usam a API compartilhada verificam identidade e ausência de alterações vindas dos Workers; não dependem de esvaziar esse registro. Não existe `reset()` global para mascarar ordem de execução.

## Contrato e limites

`emitirOrdem()` valida o nome da comporta, registra um valor com equipe/ação/turno e só então retorna. Se o registro falha, o erro é propagado. `RegistroEmMemoria` normaliza nomes, copia entradas, congela os valores e devolve uma lista defensiva. As preferências e o estado do registro usam campos `#` em execução; a variável de instância compartilhada pertence ao escopo léxico do módulo.

Não se usa `private` TypeScript como barreira de segurança nem se presume que `readonly` impeça mutação em JavaScript. A API recebe valores tipados, não valida JSON arbitrário, e não é um sistema de autorização. Registrar uma ordem não abre uma comporta física, não confirma execução, não arbitra conflitos, não persiste dados nem impede perda de memória ao encerrar o processo. O exemplo não oferece transações ou sincronização distribuída.

## Referências e evidência

Fontes primárias consultadas em 22/10/2026: [Node.js — ECMAScript modules, cache próprio do carregador ESM](https://nodejs.org/api/esm.html#no-requirecache) e [Node.js — Worker threads](https://nodejs.org/api/worker_threads.html#class-worker). A documentação corrente consultada se identifica como Node **26.12.1**; a reprodução está fixada em **26.10.0**. As observações de cache/identidade e isolamento deste projeto foram testadas nessa versão fixada, sem assumir equivalência integral entre as versões.

Captura e hashes ligam o stdout ao código executado, sem substituir auditoria técnica independente ou aprovação autoral. Não há benchmark, recurso externo único ou alegação de ganho de desempenho.
