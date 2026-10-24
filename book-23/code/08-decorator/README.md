# 08 — Decorator: Combinação de efeitos de combate

`Ataque.executar()` devolve uma potência e uma sequência de efeitos. `Espada` funciona como núcleo; `MantoDeCalor` e `MantoAmplificador` envolvem outro `Ataque`, mantêm a mesma interface e modificam seu resultado sem alterar o objeto interno.

## Executar

Node **26.10.0**, npm **11.19.1**, TypeScript **5.9.3**, `@types/node` **26.0.0**, lock próprio. Dentro deste diretório:

```sh
npm ci --ignore-scripts
npm test
npm start
npm run solution
```

Da raiz Books:

```sh
node book-23/scripts/projetos.mjs 08 install
node book-23/scripts/projetos.mjs 08 check
node book-23/scripts/projetos.mjs 08 capture
node book-23/scripts/projetos.mjs 08 verify
```

O build limpa `dist`, compila ES2022/ESM com TypeScript estrito e executa os testes Node sobre JavaScript emitido. Nenhum projeto vizinho é importado. `exercise/` fica separado da solução e fora do build oficial.

## Papéis e fontes

- `src/contratos.ts`: Component `Ataque` e seu resultado.
- `src/espada.ts`: Concrete Component `Espada`, utilizável sozinho.
- `src/mantos.ts`: Concrete Decorators por composição; não há subclasses para cada combinação.
- `src/resultado.ts`: validação numérica e cópia/congelamento dos valores de saída.
- `src/direto.ts`: função executável para a alternativa de fórmula fixa, sem wrappers.
- `src/main.ts`: duas ordens, núcleo, composição reconstruída e alternativa direta.
- `test/composicao.test.ts`: aritmética, ordem, reuso, duplicação de camadas, delegação e limites.
- `exercise/` e `solution/`: efeito limitador não comutativo, demonstração e testes.
- `diagram.mmd`: fonte lógica editável do código-base; renderização e QA visual pertencem à etapa de arte.
- `evidence/`: stdout real, testes, manifesto e execução em cópia isolada.

## Ordem e resultados observáveis

O núcleo tem potência 10, o calor soma 3 e a amplificação multiplica por 2. A operação delega primeiro ao componente interno e aplica a camada externa depois:

- `new MantoAmplificador(new MantoDeCalor(espada, 3), 2)` calcula `(10 + 3) * 2 = 26` e registra `espada → calor +3 → amplificação x2`.
- `new MantoDeCalor(new MantoAmplificador(espada, 2), 3)` calcula `10 * 2 + 3 = 23` e registra `espada → amplificação x2 → calor +3`.

Cada wrapper chama o interno uma vez e acrescenta sua responsabilidade. Resultados são valores retornados e testados, não apenas mensagens de console. Os mantos não deduplicam camadas: dois calores +3 produzem 16; dois amplificadores ×2 produzem 40 sobre o núcleo 10.

As implementações fornecidas não acumulam estado entre execuções. Cada chamada cria outro resultado e outra lista de efeitos, congelados com `Object.freeze`. Strings na lista não exigem outra camada de cópia. Mesmo quando um colaborador externo devolve uma lista mutável, o decorator copia a lista e não edita o resultado recebido. Isso não promete tornar determinístico ou imutável qualquer `Ataque` externo com estado próprio.

## Retirada e fronteiras numéricas

Retirar um manto é construir outra composição a partir das referências que o cliente preservou. `new MantoDeCalor(espada, 3)` devolve 13 sem editar a composição anterior de 26. A espada continua devolvendo 10. Não há `desempilhar()` que descubra e modifique silenciosamente uma cadeia existente, nem restauração de objetos destruídos na narrativa.

Potência e bônus devem ser inteiros seguros não negativos; fator deve ser inteiro seguro pelo menos 1. Potência zero, bônus zero e fator 1 são válidos. Frações, negativos, `NaN`, infinitos e valores fora da faixa de inteiros seguros são rejeitados. O resultado interno é validado antes da operação; cada resultado aritmético é validado antes de ser devolvido. Se a adição ou multiplicação sair da faixa permitida, a chamada lança erro em vez de publicar um valor impreciso como válido. O código usa `number`, não `BigInt` nem aproximação de quantidades fracionárias.

Esses valores são índices abstratos de um modelo fictício, sem unidade de energia, força ou temperatura. O cálculo não garante resistência de um túnel, segurança física, sucesso de resgate ou dano real. Os campos internos usam `#` em execução; entradas e colaboradores obedecem ao contrato tipado, não são um parser de JSON arbitrário.

## Custos e alternativas

Wrappers acrescentam objetos e uma ordem de execução que pode ser difícil de rastrear em cadeias longas. O cliente precisa conservar referências e saber qual composição quer reconstruir. Se a fórmula sempre for soma e depois multiplicação, `calcularPotenciaDireta(10, 3, 2)` resolve com menos estrutura e é testada produzindo 26. Essa função não expõe combinações dinâmicas ou histórico de efeitos; não é anunciada como equivalente para todos os usos dos decorators.

Proxy pode oferecer o mesmo contrato para controlar acesso, carregamento ou encaminhamento ao serviço. Aqui a intenção é acrescentar responsabilidades de cálculo, não decidir quem pode atacar. Chain of Responsibility normalmente encaminha ou decide o tratamento de uma solicitação; esta composição acumula responsabilidades e devolve o resultado do encadeamento interno. A ordem de métodos ou o nome middleware não basta para classificar uma API: não se afirma que todo middleware seja Decorator.

Captura e hashes ligam saídas às fontes executadas. Não substituem auditoria técnica independente nem aprovação autoral; não há benchmark ou promessa de desempenho.
