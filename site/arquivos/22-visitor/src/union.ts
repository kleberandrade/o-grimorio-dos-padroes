import { nomeValido, indiceValido } from "./contratos.js";

export type Ficha = { readonly tipo: "guerreiro"; readonly nome: string; readonly forca: number }
  | { readonly tipo: "mago"; readonly nome: string; readonly mana: number }
  | { readonly tipo: "arqueiro"; readonly nome: string; readonly pontaria: number };

export function avaliarFicha(ficha: Ficha) {
  nomeValido(ficha.nome);
  switch (ficha.tipo) {
    case "guerreiro": { const forca = indiceValido(ficha.forca); return Object.freeze({ capacidade: forca * 2, custo: forca + 10 }); }
    case "mago": { const mana = indiceValido(ficha.mana); return Object.freeze({ capacidade: mana * 3, custo: mana * 2 + 5 }); }
    case "arqueiro": { const pontaria = indiceValido(ficha.pontaria); return Object.freeze({ capacidade: pontaria * 2, custo: pontaria + 15 }); }
    default: throw new Error("Tipo de ficha inválido.");
  }
}
