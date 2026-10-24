import assert from "node:assert/strict";
import { test } from "node:test";
import { liberarRochaDoFarol } from "../src/cliente.js";
import { DragaoMaritimoAdapter } from "./adapter-maritimo.js";
import { DragaoMaritimo } from "./fornecedor-maritimo.js";

test("segundo fornecedor é aceito pelo cliente e converte nós em m/s", () => {
  const resultado = liberarRochaDoFarol(new DragaoMaritimoAdapter(new DragaoMaritimo()), "Trava");
  assert.ok(Math.abs(resultado.velocidadeMps - 5.144444444444444) < 1e-12);
  assert.deepEqual(resultado.resultado, { alvo: "Trava", efeito: "fogo", rochaLiberada: true });
});

test("o adapter marítimo preserva alvo, falha de desobstrução e restrição do efeito", () => {
  const alvos: string[] = [];
  const fornecedor: DragaoMaritimo = {
    velocidadeEmNos: () => 10,
    aquecerRocha: (identificador) => { alvos.push(identificador); return { identificador, liberada: false }; },
  };
  const adapter = new DragaoMaritimoAdapter(fornecedor);
  assert.equal(adapter.atacar({ alvo: " Trava ", efeito: "fogo" }).rochaLiberada, false);
  assert.throws(() => adapter.atacar({ alvo: "Trava", efeito: "gelo" }), { name: "RecursoSemEquivalente" });
  assert.deepEqual(alvos, ["Trava"]);
});

test("segundo fornecedor com velocidade não finita é recusado", () => {
  const fornecedor: DragaoMaritimo = {
    velocidadeEmNos: () => Number.NaN,
    aquecerRocha: (identificador) => ({ identificador, liberada: true }),
  };
  assert.throws(() => new DragaoMaritimoAdapter(fornecedor).velocidadeMps(), { message: "Velocidade deve ser não negativa e finita." });
});
