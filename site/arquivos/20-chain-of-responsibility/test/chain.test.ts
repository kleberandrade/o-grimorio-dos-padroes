import assert from "node:assert/strict";
import { test } from "node:test";
import { Cadeia } from "../src/cadeia.js";
import type { Decisao, Handler, Pedido } from "../src/contratos.js";
import { decisao } from "../src/contratos.js";
import { Guarda, Conselheira, Regencia } from "../src/handlers.js";

const passagem: Pedido = { tipo: "passagem", solicitante: "Alda", prioridade: "urgente", rota: "porta-dos-carros" };
const padrao = () => new Cadeia([new Guarda(), new Conselheira(), new Regencia()]);

test("primeiro responsável que trata interrompe sem chamar elos posteriores", () => {
  let posteriores = 0;
  const depois: Handler = { nome: "Depois", decidir: () => { posteriores += 1; return decisao("negado", "Não deveria executar."); } };
  const resultado = new Cadeia([new Guarda(), depois]).processar(passagem);
  assert.equal(resultado.status, "tratado");
  assert.equal(resultado.responsavel, "Guarda");
  assert.deepEqual(resultado.percurso, [{ handler: "Guarda", decisao: "tratado" }]);
  assert.equal(posteriores, 0);
});

test("negativa é terminal e não deixa próximo elo revogar decisão silenciosamente", () => {
  let posteriores = 0;
  const cadeia = new Cadeia([{ nome: "Nega", decidir: () => decisao("negado", "Limite local.") },
    { nome: "Aceita", decidir: () => { posteriores += 1; return decisao("tratado", "Outra política."); } }]);
  assert.equal(cadeia.processar(passagem).status, "negado");
  assert.equal(posteriores, 0);
});

test("exceção de galeria percorre três elos e recebe negativa; alternativa exige outro pedido", () => {
  const cadeia = padrao();
  const negativa = cadeia.processar({ ...passagem, rota: "galeria-interna" });
  assert.equal(negativa.status, "negado");
  assert.deepEqual(negativa.percurso.map((item) => item.decisao), ["naoTratado", "naoTratado", "negado"]);
  assert.equal(negativa.responsavel, "Regência");
  const alternativa = cadeia.processar(passagem);
  assert.equal(alternativa.status, "tratado");
  assert.equal(alternativa.responsavel, "Guarda");
  assert.equal(negativa.status, "negado");
});

test("provisões têm limite explícito e não são confundidas com passagem", () => {
  const cadeia = padrao();
  const pedido: Pedido = { tipo: "provisoes", solicitante: "Alda", prioridade: "normal", quantidade: 5 };
  assert.equal(cadeia.processar(pedido).status, "tratado");
  const negado = cadeia.processar({ ...pedido, quantidade: 6 });
  assert.equal(negado.status, "negado");
  assert.equal(negado.responsavel, "Conselheira");
  assert.equal(negado.percurso.length, 2);
});

test("fim sem responsável e cadeia vazia devolvem naoTratado explícito", () => {
  const audiencia: Pedido = { tipo: "audiencia", solicitante: "Alda", prioridade: "normal", assunto: "Reparos" };
  const resultado = padrao().processar(audiencia);
  assert.equal(resultado.status, "naoTratado");
  assert.equal(resultado.responsavel, null);
  assert.equal(resultado.percurso.length, 3);
  assert.deepEqual(new Cadeia([]).processar(passagem), { status: "naoTratado", motivo: "Nenhum elo responsável nesta cadeia.", responsavel: null, percurso: [] });
});

test("conteúdo textual com palavra invasão não vira detector de ameaça ou autenticação", () => {
  const pedido: Pedido = { tipo: "audiencia", solicitante: "relato de invasão", prioridade: "urgente", assunto: "Estudo da palavra invasão" };
  assert.equal(padrao().processar(pedido).status, "naoTratado");
  assert.equal(padrao().processar({ ...passagem, solicitante: "qualquer nome declarado" }).status, "tratado");
});

test("pedido inválido é erro de dados antes de decidir, não negativa de autorização", () => {
  let chamadas = 0;
  const cadeia = new Cadeia([{ nome: "Conta", decidir: () => { chamadas += 1; return decisao("tratado", "Ok."); } }]);
  const invalidos: unknown[] = [
    { ...passagem, solicitante: " " }, { ...passagem, prioridade: "talvez" }, { ...passagem, rota: "desconhecida" },
    { ...passagem, tipo: "outro" },
    ...[0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map((quantidade) => ({ tipo: "provisoes", solicitante: "Alda", prioridade: "normal", quantidade })),
  ];
  for (const pedido of invalidos) assert.throws(() => cadeia.processar(pedido as Pedido));
  assert.equal(chamadas, 0);
});

test("lista configurada é copiada; identidade duplicada é recusada e nomes iguais não são identidade", () => {
  const guarda = new Guarda();
  const elos: Handler[] = [guarda];
  const cadeia = new Cadeia(elos);
  elos.length = 0;
  assert.equal(cadeia.processar(passagem).responsavel, "Guarda");
  assert.throws(() => new Cadeia([guarda, guarda]));
  assert.equal(new Cadeia([new Guarda(), new Guarda()]).processar(passagem).percurso.length, 1);
});

test("nome e função são capturados na montagem; estado fechado de extensão não é congelado genericamente", () => {
  let chamadas = 0;
  const handler = { nome: "Original", decidir: (_pedido: Pedido): Decisao => { chamadas += 1; return decisao("tratado", "Primeira função."); } };
  const cadeia = new Cadeia([handler]);
  handler.nome = "Substituído";
  handler.decidir = () => decisao("negado", "Função nova.");
  assert.equal(cadeia.processar(passagem).responsavel, "Original");
  assert.equal(chamadas, 1);
});

test("pedido e resultado têm cópias/congelamento dos dados declarados", () => {
  const entrada = { ...passagem, solicitante: " Alda " };
  let recebido: Pedido | undefined;
  const resposta = { status: "tratado" as const, motivo: "Ok." };
  const cadeia = new Cadeia([{ nome: "Observa", decidir: (pedido) => {
    recebido = pedido;
    assert.equal(Reflect.set(pedido, "solicitante", "outro"), false);
    return resposta;
  } }]);
  const resultado = cadeia.processar(entrada);
  entrada.solicitante = "Mudou";
  resposta.motivo = "Mudou depois";
  assert.equal(recebido!.solicitante, "Alda");
  assert.equal(resultado.motivo, "Ok.");
  assert.equal(Reflect.set(resultado, "status", "negado"), false);
  assert.equal(Reflect.set(resultado.percurso, "0", {}), false);
  assert.equal(Reflect.set(resultado.percurso[0]!, "handler", "outro"), false);
});

test("repetir pedido reavalia handlers; não implica idempotência de efeitos externos", () => {
  let chamadas = 0;
  const cadeia = new Cadeia([{ nome: "Conta", decidir: () => { chamadas += 1; return decisao("tratado", "Contado."); } }]);
  const primeiro = cadeia.processar(passagem);
  const segundo = cadeia.processar(passagem);
  assert.deepEqual(primeiro, segundo);
  assert.notEqual(primeiro, segundo);
  assert.equal(chamadas, 2);
});

test("reentrância na mesma cadeia é recusada; falha propaga sem rollback e libera próxima avaliação", () => {
  let cadeia: Cadeia;
  let primeira = true;
  let efeitos = 0;
  const handler: Handler = { nome: "Reentra", decidir: (pedido) => {
    efeitos += 1;
    if (primeira) { primeira = false; cadeia.processar(pedido); }
    return decisao("tratado", "Concluiu.");
  } };
  cadeia = new Cadeia([handler]);
  assert.throws(() => cadeia.processar(passagem), { message: "Reentrância recusada nesta cadeia." });
  assert.equal(efeitos, 1);
  assert.equal(cadeia.processar(passagem).status, "tratado");
  assert.equal(efeitos, 2);
});

test("status de extensão incompatível é erro, não falso desfecho de negócio", () => {
  const handler: Handler = { nome: "Inválido", decidir: () => ({ status: "talvez", motivo: "Ok." } as unknown as Decisao) };
  assert.throws(() => new Cadeia([handler]).processar(passagem), { message: "Status inválido devolvido pelo handler." });
});
