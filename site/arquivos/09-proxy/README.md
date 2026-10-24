# 09 — Proxy: Acesso controlado ao salão real

Subject `Sala` oferece `entrar(Visitante)`. `SalaReal` registra entradas; `ProxyDeProtecao` implementa o mesmo contrato, consulta uma política injetada e só delega quando ela permite. A variante virtual mora separadamente na solução do exercício.

## Executar

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, lock independente. Dentro deste projeto:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books:

```sh
node book-23/scripts/projetos.mjs 09 install
node book-23/scripts/projetos.mjs 09 check
node book-23/scripts/projetos.mjs 09 capture
node book-23/scripts/projetos.mjs 09 verify
```

O build limpa `dist` e compila ES2022/ESM com TypeScript estrito. Testes Node executam o JavaScript emitido. Não há importações de capítulos vizinhos; tentativas em `exercise/` ficam fora do build oficial.

## Fontes e papéis

- `src/contratos.ts`: Subject `Sala`, visitante, decisões e resultados discriminados.
- `src/sala-real.ts`: Real Subject com histórico observável.
- `src/proxy-protecao.ts`: Protection Proxy por composição.
- `src/politica.ts`: política didática por mandato informado e normalização dos nomes.
- `src/servico-com-controle.ts`: alternativa com verificação no próprio serviço, sem um objeto real desprotegido exposto por ele.
- `src/main.ts`: negativa, permissão, contagem e bypass direto demonstrado.
- `test/protecao.test.ts`: chamadas, identidade do resultado, decisões, erros, histórico e alternativa.
- `exercise/` e `solution/`: Virtual Proxy com carregador síncrono injetado e seus testes.
- `diagram.mmd`: fonte lógica editável; renderização e QA visual pertencem à etapa de arte.
- `evidence/`: stdout real, testes, manifesto e execução em cópia isolada.

## Contrato de entrada e política

`Visitante` contém nome e `mandatoValido`, um booleano fornecido. Nomes vazios geram erro; nomes válidos são normalizados sem modificar o pedido original. A política recebe uma cópia congelada com esses valores e devolve `{permitida, motivo}`. O proxy não classifica nome, ofício, título, aparência ou simpatia como merecimento moral.

Se a política nega, o resultado é `{estado: 'negada', visitante, motivo}` congelado e o real não é acionado. Se permite, o proxy chama a sala uma vez e devolve **o mesmo objeto de resultado** retornado por ela. Não fabrica número de registro nem converte um erro em sucesso. Exceções da política e da sala são propagadas; falha da política impede a delegação.

`SalaReal` guarda um registro sequencial local por entrada, com número, nome e estado `permitida`. As entradas são congeladas e a lista consultada é defensiva. O registro é um efeito local em memória, sem persistência, comprovação física ou auditoria externa. A negativa devolvida permite ao cliente documentá-la, mas o proxy não cria um diário persistente por conta própria.

## Fronteira didática

`mandatoValido` **não autentica identidade**, não verifica assinatura ou documento e não representa uma fronteira de segurança. O cliente pode fornecer `true`. Além disso, chamar `SalaReal.entrar()` diretamente contorna a política: há teste e demonstração explícitos. Uma política recebida também não torna confiáveis implementações arbitrárias do serviço ou do chamador.

Controles reais de identidade, autorização, dados confiáveis e caminhos de acesso pertencem ao desenho da aplicação de produção; este modelo não os implementa nem os substitui. Seu propósito é observar a decisão de delegação e o contrato comum. Não abre portas físicas, não aciona a válvula e não garante drenagem ou segurança de um edifício. Os dados são tipados, sem validação genérica de JSON ou mecanismos de defesa para entradas externas arbitrárias.

`SalaComControleProprio` mostra uma alternativa simples: a verificação integra o serviço e ele não entrega ao cliente um Real Subject separado que ignore a decisão. Isso elimina o bypass específico do exemplo por aquela API; a mesma política booleana continua didática e não ganha autenticação ou garantias de produção por estar em outro lugar.

## Proteção e virtualização

O proxy de proteção recebe uma sala já criada. Não é Virtual Proxy nem carregamento tardio. `ProxyVirtual`, separado em `solution/`, recebe `() => Sala`, carrega na primeira operação e reutiliza a instância. Ele não adiciona política de proteção, e o teste demonstra entrada sem mandato no real dessa variante.

O carregamento é estritamente síncrono. Se o carregador lança erro, a referência continua ausente e outra chamada explícita pode tentar novamente. Se a carga deu certo, mas a operação da sala falha, a instância permanece guardada e as próximas chamadas não recarregam. A primeira operação carrega antes de delegar qualquer validação ao serviço; nome inválido não é promessa de impedir a carga. Não há Promise, tratamento de corrida assíncrona, retentativa automática, invalidação ou benchmark de criação.

## Custos e comparações

Proxy acrescenta uma camada, uma política de ciclo de vida ou delegação e mais um caminho que precisa ser compreendido. Quando o serviço pode aplicar seu controle de forma simples e apropriada ao contexto, uma camada separada pode não se justificar.

Decorator também pode conservar a interface, mas sua intenção é acrescentar responsabilidades ao comportamento; aqui a intenção é controlar acesso ou adiar criação. Adapter traduz interfaces incompatíveis; este Proxy mantém `Sala` em ambos os lados. Semelhança estrutural não torna as intenções equivalentes.

Testes, stdout e hashes vinculam execução às fontes. Não são auditoria técnica independente nem aprovação autoral, e não estabelecem segurança ou desempenho de uma integração real.
