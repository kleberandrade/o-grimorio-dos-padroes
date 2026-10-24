export function demonstrarNativo() {
  const valores = [1, 2, 3];
  let chamadasIterator = 0;
  const iteradorOriginal = valores[Symbol.iterator].bind(valores);
  Object.defineProperty(valores, Symbol.iterator, { value: () => { chamadasIterator += 1; return iteradorOriginal(); } });
  const porCallback: number[] = [];
  valores.forEach((valor) => { porCallback.push(valor); });
  const dobrados = valores.map((valor) => valor * 2);
  const aposCallbacks = chamadasIterator;
  const porProtocolo: number[] = [];
  for (const valor of valores) porProtocolo.push(valor);
  return Object.freeze({ porCallback: Object.freeze(porCallback), dobrados: Object.freeze(dobrados),
    porProtocolo: Object.freeze(porProtocolo), aposCallbacks, aposForOf: chamadasIterator });
}
