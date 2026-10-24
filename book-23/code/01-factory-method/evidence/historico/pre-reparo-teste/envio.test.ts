import assert from "node:assert/strict";
import { test } from "node:test";
import { avisarGuilda } from "../src/cliente.js";
import { CorreioEmMemoria } from "../src/correio-em-memoria.js";
import { CriadorDeCristal, CriadorDeNotificacoes, CriadorDePergaminho } from "../src/criadores.js";
import type { Correio, Mensageiro } from "../src/contratos.js";

const pedido = { destino: "Posto da Ponte", mensagem: "Fechem a comporta." };

test("o mesmo cliente preserva conteúdo e destino ao trocar criadores", () => {
  const correio = new CorreioEmMemoria();
  const criadores = [new CriadorDeCristal(correio), new CriadorDePergaminho(correio)];
  const recibos = criadores.map((criador) => avisarGuilda(criador, pedido));
  assert.deepEqual(recibos, [
    { id: 1, canal: "cristal", ...pedido },
    { id: 2, canal: "pergaminho", ...pedido },
  ]);
  assert.deepEqual(correio.listarEntregas(), recibos);
});

test("a operação comum normaliza espaços sem alterar o pedido original", () => {
  const correio = new CorreioEmMemoria();
  const entrada = { destino: " Ponte ", mensagem: " Alerta! " };
  const recibo = new CriadorDeCristal(correio).enviar(entrada);
  assert.equal(recibo.destino, "Ponte");
  assert.equal(recibo.mensagem, "Alerta!");
  assert.deepEqual(entrada, { destino: " Ponte ", mensagem: " Alerta! " });
});

for (const [campo, erro] of [["destino", "Destino obrigatório."], ["mensagem", "Mensagem obrigatória."]] as const) {
  test(`${campo} vazio não gera entrega`, () => {
    const correio = new CorreioEmMemoria();
    assert.throws(() => new CriadorDePergaminho(correio).enviar({ ...pedido, [campo]: " \n " }), { message: erro });
    assert.deepEqual(correio.listarEntregas(), []);
  });
}

test("um terceiro criador usa o mesmo cliente e a operação herdada", () => {
  class CriadorDeTeste extends CriadorDeNotificacoes {
    protected override criarMensageiro(): Mensageiro {
      return { entregar: (envio) => this.correio.entregar("teste", envio) };
    }
  }
  const correio = new CorreioEmMemoria();
  assert.deepEqual(avisarGuilda(new CriadorDeTeste(correio), pedido), { id: 1, canal: "teste", ...pedido });
});

test("a falha do correio é propagada sem fabricar comprovante de sucesso", () => {
  const falha = new Error("Canal indisponível.");
  const correio: Correio = { entregar: () => { throw falha; } };
  assert.throws(() => new CriadorDeCristal(correio).enviar(pedido), (erro: unknown) => erro === falha);
});

test("a lista devolvida e o pedido não permitem corromper o histórico local", () => {
  const correio = new CorreioEmMemoria();
  const entrada = { ...pedido };
  const recibo = new CriadorDeCristal(correio).enviar(entrada);
  entrada.mensagem = "Alteração posterior";
  const copia = [...correio.listarEntregas()];
  copia.pop();
  assert.equal(correio.listarEntregas().length, 1);
  assert.equal(correio.listarEntregas()[0]?.mensagem, pedido.mensagem);
  assert.equal(Object.isFrozen(recibo), true);
});
