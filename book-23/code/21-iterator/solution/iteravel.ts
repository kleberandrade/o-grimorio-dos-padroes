import type { ArquivoOrdens, Ordem } from "../src/contratos.js";

export class ArquivoIterable implements Iterable<Ordem> {
  readonly #origem: ArquivoOrdens;
  constructor(origem: ArquivoOrdens) { this.#origem = origem; }

  [Symbol.iterator](): IterableIterator<Ordem, undefined, unknown> {
    const percurso = this.#origem.criarPercurso(); // Captura agora, não no primeiro next.
    let encerrado = false;
    return Object.freeze({
      next(): IteratorResult<Ordem, undefined> {
        if (encerrado) return Object.freeze({ done: true, value: undefined });
        const passo = percurso.proximo();
        if (passo.fim) { encerrado = true; return Object.freeze({ done: true, value: undefined }); }
        return Object.freeze({ done: false, value: passo.ordem });
      },
      return(): IteratorResult<Ordem, undefined> {
        encerrado = true;
        return Object.freeze({ done: true, value: undefined });
      },
      [Symbol.iterator]() { return this; },
    });
  }
}

export function gerarSnapshot(origem: ArquivoOrdens): Generator<Ordem, undefined, unknown> {
  const percurso = origem.criarPercurso(); // Fábrica normal: executa ao chamar gerarSnapshot.
  return (function* () {
    while (true) {
      const passo = percurso.proximo();
      if (passo.fim) return undefined;
      yield passo.ordem;
    }
  })();
}
