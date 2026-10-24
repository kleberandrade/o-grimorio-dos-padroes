import { politicaPorMandato } from "./politica.js";
import { ProxyDeProtecao } from "./proxy-protecao.js";
import { SalaReal } from "./sala-real.js";
import { SalaComControleProprio } from "./servico-com-controle.js";

const real = new SalaReal();
const proxy = new ProxyDeProtecao(real, politicaPorMandato);
console.log(`Nobre sem mandato: ${proxy.entrar({ nome: "Nobre", mandatoValido: false }).estado}`);
console.log(`Entradas no real após negativa: ${real.listarEntradas().length}`);
console.log(`Mecânico com mandato: ${proxy.entrar({ nome: "Mecânico", mandatoValido: true }).estado}`);
console.log(`Entradas no real após permissão: ${real.listarEntradas().length}`);

// Demonstra o limite: o real exposto não verifica a política por conta própria.
const direta = real.entrar({ nome: "Entrada lateral", mandatoValido: false });
console.log(`Acesso direto ao real sem mandato: ${direta.estado}`);
console.log(`Entradas no real após acesso direto: ${real.listarEntradas().length}`);
const integrado = new SalaComControleProprio(politicaPorMandato);
console.log(`Serviço com controle próprio sem mandato: ${integrado.entrar({ nome: "Visitante", mandatoValido: false }).estado}`);
