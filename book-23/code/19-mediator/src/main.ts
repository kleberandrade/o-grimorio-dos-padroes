import { montarConselho } from "./montagem.js";

// Alternativa direta para dois colaboradores simples e estáveis.
let registroDireto = 0;
const registrarPedido = () => { registroDireto += 1; };
registrarPedido();
console.log(`Chamada direta: ${registroDireto} pedido registrado`);

const { conselho, barqueiros, cultivadores, guarda } = montarConselho();
console.log(`Autorização precoce: ${guarda.confirmarAutorizacao(true).status}`);
console.log(`Pedido: ${barqueiros.pedirAbertura().estado}`);
console.log(`Inspeção: ${cultivadores.confirmarInspecao(true).estado}`);
console.log(`Amarras: ${barqueiros.confirmarAmarras(true).estado}`);
console.log(`Autorização: ${guarda.confirmarAutorizacao(true).estado}`);
for (const despacho of conselho.snapshot().despachos) console.log(`${despacho.destinatario}.${despacho.acao}: ${despacho.status}`);
console.log(`Aberta no modelo: ${guarda.snapshot().aberta} | acionamentos: ${guarda.snapshot().acionamentos}`);
console.log(`Segundo pedido: ${barqueiros.pedirAbertura().status}`);
