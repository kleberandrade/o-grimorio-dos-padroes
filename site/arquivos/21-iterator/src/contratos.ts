export interface Ordem { readonly id: number; readonly descricao: string; }
export type PassoLocal = Readonly<{ fim: false; ordem: Ordem }> | Readonly<{ fim: true }>;
export interface IteradorOrdens { proximo(): PassoLocal; }
export interface ArquivoOrdens { criarPercurso(): IteradorOrdens; }

export function copiarOrdem(ordem: Ordem): Ordem {
  if (!Number.isSafeInteger(ordem.id) || ordem.id <= 0) throw new Error("Id deve ser inteiro positivo seguro.");
  if (typeof ordem.descricao !== "string" || !ordem.descricao.trim()) throw new Error("Descrição não vazia obrigatória.");
  return Object.freeze({ id: ordem.id, descricao: ordem.descricao.trim() });
}
