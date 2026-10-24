import assert from "node:assert/strict";
import { test } from "node:test";
import { DragaoAdapter } from "../src/adapter.js";
import { liberarRochaDoFarol } from "../src/cliente.js";
import { RecursoSemEquivalente } from "../src/contratos.js";
import { DragaoAntigo } from "../src/legado/dragao-antigo.js";
import { DragaoNativo } from "../src/nativo.js";

test("o mesmo cliente usa o nativo e o legado adaptado com dados equivalentes", () => {
  const esperado = { velocidadeMps: 10, resultado: { alvo: "Trava", efeito: "fogo", rochaLiberada: true } };
  assert.deepEqual(liberarRochaDoFarol(new DragaoNativo(), "Trava"), esperado);
  assert.deepEqual(liberarRochaDoFarol(new DragaoAdapter(new DragaoAntigo()), "Trava"), esperado);
});

test("a velocidade é convertida de km/h para m/s, inclusive valores fracionários", () => {
  const legado: DragaoAntigo = { voarVelocidade: () => 1, soltarFogo: (alvo) => ({ rocha: alvo, desobstruida: true }) };
  assert.ok(Math.abs(new DragaoAdapter(legado).velocidadeMps() - 0.2777777777777778) < 1e-12);
});

test("conversão e ataque delegam uma chamada cada, com alvo normalizado", () => {
  const chamadas: string[] = [];
  const legado: DragaoAntigo = {
    voarVelocidade: () => { chamadas.push("velocidade"); return 36; },
    soltarFogo: (alvo) => { chamadas.push(`fogo:${alvo}`); return { rocha: alvo, desobstruida: true }; },
  };
  const resultado = liberarRochaDoFarol(new DragaoAdapter(legado), " Trava ");
  assert.deepEqual(chamadas, ["velocidade", "fogo:Trava"]);
  assert.equal(resultado.resultado.alvo, "Trava");
});

test("falha de desobstrução do legado não vira sucesso no contrato moderno", () => {
  const legado: DragaoAntigo = { voarVelocidade: () => 36, soltarFogo: (alvo) => ({ rocha: alvo, desobstruida: false }) };
  assert.equal(liberarRochaDoFarol(new DragaoAdapter(legado), "Trava").resultado.rochaLiberada, false);
});

test("efeito sem equivalente é recusado antes de chamar fogo", () => {
  let fogos = 0;
  const legado: DragaoAntigo = {
    voarVelocidade: () => 36,
    soltarFogo: (alvo) => { fogos++; return { rocha: alvo, desobstruida: true }; },
  };
  assert.throws(() => new DragaoAdapter(legado).atacar({ alvo: "Trava", efeito: "gelo" }), {
    name: "RecursoSemEquivalente", message: "Pacto não oferece equivalente para gelo.",
  });
  assert.equal(fogos, 0);
  assert.throws(() => new DragaoNativo().atacar({ alvo: "Trava", efeito: "gelo" }), RecursoSemEquivalente);
});

test("alvo vazio não aciona o legado", () => {
  let fogos = 0;
  const legado: DragaoAntigo = {
    voarVelocidade: () => 36,
    soltarFogo: (alvo) => { fogos++; return { rocha: alvo, desobstruida: true }; },
  };
  assert.throws(() => new DragaoAdapter(legado).atacar({ alvo: " ", efeito: "fogo" }), { message: "Alvo de rocha obrigatório." });
  assert.equal(fogos, 0);
});

for (const velocidade of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
  test(`velocidade legada ${velocidade} é rejeitada`, () => {
    const legado: DragaoAntigo = { voarVelocidade: () => velocidade, soltarFogo: (alvo) => ({ rocha: alvo, desobstruida: true }) };
    assert.throws(() => new DragaoAdapter(legado).velocidadeMps(), { message: "Velocidade deve ser não negativa e finita." });
  });
}

test("velocidade zero é válida no contrato numérico, sem prometer transporte", () => {
  const legado: DragaoAntigo = { voarVelocidade: () => 0, soltarFogo: (alvo) => ({ rocha: alvo, desobstruida: true }) };
  assert.equal(new DragaoAdapter(legado).velocidadeMps(), 0);
  assert.equal(new DragaoNativo(0).velocidadeMps(), 0);
});

test("erro do legado é propagado sem fabricar resultado", () => {
  const falha = new Error("Pacto indisponível.");
  const legado: DragaoAntigo = { voarVelocidade: () => 36, soltarFogo: () => { throw falha; } };
  assert.throws(() => liberarRochaDoFarol(new DragaoAdapter(legado), "Trava"), (erro: unknown) => erro === falha);
});

test("o resultado é uma cópia congelada, sem alias do objeto retornado pelo legado", () => {
  const resposta = { rocha: "Trava", desobstruida: true };
  const legado: DragaoAntigo = { voarVelocidade: () => 36, soltarFogo: () => resposta };
  const resultado = new DragaoAdapter(legado).atacar({ alvo: "Trava", efeito: "fogo" });
  resposta.desobstruida = false;
  assert.equal(resultado.rochaLiberada, true);
  assert.equal(Reflect.set(resultado, "rochaLiberada", false), false);
});
