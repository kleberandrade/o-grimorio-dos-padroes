import { EstoqueMinerio } from "./estoque.js";
import { ComandoReservar } from "./comando.js";
import { Invocador } from "./invocador.js";

const estoque = new EstoqueMinerio(12);
const mostrar = (rotulo: string) => {
  const estado = estoque.snapshot();
  console.log(`${rotulo}: disponível ${estado.disponivel} | reservado ${estado.reservado} | forjado ${estado.forjado}`);
};
// Alternativa direta: sem histórico, a composição conhece e chama o receptor.
const parcelaDoForno = estoque.reservar(4);
estoque.forjar(parcelaDoForno, 4);
mostrar("Parcela consumida");
const livro = new Invocador(2);
const ordem = new ComandoReservar(estoque, 8);
console.log(`Antes da execução, histórico: ${livro.listarHistorico().length}`);
livro.executar(ordem);
mostrar("Reserva de Davi");
console.log(`Histórico: ${livro.listarHistorico().map((item) => item.descricao).join(", ")}`);
console.log(`Desfazer reserva: ${livro.desfazerUltimo()}`);
mostrar("Parcela intacta liberada");
console.log(`Desfazer histórico vazio: ${livro.desfazerUltimo()}`);
