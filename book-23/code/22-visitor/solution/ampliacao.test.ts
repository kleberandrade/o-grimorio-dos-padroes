import assert from "node:assert/strict";
import { test } from "node:test";
import { Guerreiro, Mago, Arqueiro, Curandeiro } from "./membros-ampliados.js";
import type { VisitanteAmpliado } from "./contratos-ampliados.js";
import { CalcularCapacidade, CalcularCusto, totalizar } from "./visitantes-ampliados.js";

test("versões ampliadas dos DOIS visitantes calculam o quarto tipo e os totais", () => {
  const membros = [new Guerreiro("Ivo", 6), new Mago("Lume", 4), new Arqueiro("Cora", 5), new Curandeiro("Neve", 3)];
  assert.equal(membros[3]!.aceitar(new CalcularCapacidade()), 6);
  assert.equal(membros[3]!.aceitar(new CalcularCusto()), 17);
  assert.equal(totalizar(membros, new CalcularCapacidade()), 40);
  assert.equal(totalizar(membros, new CalcularCusto()), 66);
});

test("aceitar do curandeiro despacha somente visitarCurandeiro", () => {
  const curandeiro = new Curandeiro("Neve", 3);
  const chamadas: string[] = [];
  const visitante: VisitanteAmpliado<string> = {
    visitarGuerreiro: () => { throw new Error("Tipo errado."); }, visitarMago: () => { throw new Error("Tipo errado."); },
    visitarArqueiro: () => { throw new Error("Tipo errado."); },
    visitarCurandeiro: (membro) => { assert.equal(membro, curandeiro); chamadas.push("curandeiro"); return "C"; },
  };
  assert.equal(curandeiro.aceitar(visitante), "C");
  assert.deepEqual(chamadas, ["curandeiro"]);
});

test("visitas antigas preservam fórmulas e curandeiro obedece as mesmas fronteiras de entrada", () => {
  const membros = [new Guerreiro("Ivo", 6), new Mago("Lume", 4), new Arqueiro("Cora", 5)];
  assert.equal(totalizar(membros, new CalcularCapacidade()), 34);
  assert.equal(totalizar(membros, new CalcularCusto()), 49);
  assert.equal(new Curandeiro("C", 0).aceitar(new CalcularCusto()), 8);
  assert.equal(new Curandeiro("C", 100).aceitar(new CalcularCapacidade()), 200);
  for (const invalido of [-1, 101, 0.5, NaN, Infinity]) assert.throws(() => new Curandeiro("C", invalido));
  assert.throws(() => new Curandeiro(" ", 1));
});
