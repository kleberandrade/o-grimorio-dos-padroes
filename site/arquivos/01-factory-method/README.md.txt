# 01 — Factory Method: Mensageiros da guilda

Uma rotina de envio precisa continuar válida quando a criação do mensageiro muda. O projeto demonstra o Factory Method canônico: subclasses sobrescrevem `criarMensageiro()`, e `CriadorDeNotificacoes.enviar()` usa o produto por meio da interface `Mensageiro`.

## Executar isoladamente

Requer Node 26.10.0 e npm 11.19.1 (se houver nvm: `nvm use`). Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

`npm test` limpa `dist`, compila fontes/testes/solução com TypeScript estrito e executa `node:test`. `exercise/` fica fora do build, separado da resposta. Nenhum outro capítulo é importado.

## Arquivos e responsabilidades

- `src/contratos.ts`: pedido, comprovante, produto e porta de correio.
- `src/criadores.ts`: Creator, operação comum e Concrete Creators.
- `src/mensageiros.ts`: Concrete Products.
- `src/correio-em-memoria.ts`: simulador local com histórico observável.
- `src/cliente.ts`: cliente que depende do criador abstrato.
- `src/main.ts`: composição e demonstração.
- `test/`: preservação do contrato, limites e falha do correio.
- `exercise/README.md`: enunciado e critérios.
- `solution/`: extensão de corvo, execução e testes.
- `diagram.mmd`: relações editáveis correspondentes ao código-base.
- `evidence/`: saídas reais, resultados e manifesto SHA-256.

## Contrato e limites

`enviar()` remove espaços externos de destino e mensagem, rejeita strings vazias e só então cria um mensageiro. Um envio válido gera exatamente um registro local. O comprovante e a lista consultada não expõem mutação do histórico interno. Uma falha do correio é propagada; não há fallback automático nem retentativa.

O correio é síncrono, local e em memória: registro não significa recebimento por pessoa, transporte de rede, persistência, criptografia ou confirmação remota. IDs são sequenciais por instância, não globais. Os parâmetros têm tipos estáticos; a aplicação não valida JSON arbitrário nem é uma API pública pronta para produção. TypeScript não tem `final`: não sobrescrever `enviar()` é contrato de extensão, não bloqueio da linguagem.

## Alternativa e custo

Se só for preciso escolher um rótulo de canal, uma função como `correio.entregar(canal, pedido)` resolve com menos classes. A hierarquia serve aqui para estudar uma operação herdada cujo ponto de criação varia, com produtos substituíveis. Adiciona classes, arquivos e acoplamento por herança. O exemplo reduz os transportes ao mínimo para observar o mecanismo, sem alegar que uma hierarquia se paga neste simulador.

Uma Simple Factory centralizaria uma escolha de produto (por exemplo, em uma função com discriminador). Aqui a operação chama um método sobrescrito pelas subclasses. Abstract Factory trata de famílias de produtos relacionados; não se distingue apenas pela quantidade de objetos produzidos.

O exercício amplia os canais sem editar a operação comum. A solução de corvo continua uma simulação; não mede latência nem capacidade de transporte.
