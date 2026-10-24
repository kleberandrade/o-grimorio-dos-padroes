import { montarCasaDeControle } from "./composicao.js";
import { observarOutroContexto } from "./contextos.js";
import { obterRegistroCompartilhado } from "./modulo-compartilhado.js";
import { criarExemploDePreferenciaGlobal } from "./preferencia-compartilhada.js";
import { RegistroEmMemoria } from "./registro.js";

// Alternativa simples: a composição escolhe uma instância sem acesso global.
const casaLocal = montarCasaDeControle(new RegistroEmMemoria());
const outraCasa = montarCasaDeControle(new RegistroEmMemoria());
console.log(`Instâncias explícitas distintas: ${casaLocal.registro !== outraCasa.registro}`);

// A API compartilhada só é chamada na raiz; os serviços recebem Registro.
const registro = obterRegistroCompartilhado();
console.log(`API compartilhada mesma instância: ${registro === obterRegistroCompartilhado()}`);
const casa = montarCasaDeControle(registro);

const armadilha = criarExemploDePreferenciaGlobal();
armadilha.sul.turno = "noite";
console.log(`Preferência compartilhada indevida: Norte herdou ${armadilha.norte.turno}`);

casa.equipeSul.definirTurno("noite");
const sul = casa.equipeSul.emitirOrdem("Leste", "fechar");
const norte = casa.equipeNorte.emitirOrdem("Oeste", "abrir");
console.log(`Preferências locais: Sul ${sul.turno} | Norte ${norte.turno}`);
console.log(`Ordens no registro da casa: ${registro.listarOrdens().length}`);

const sonda = await observarOutroContexto();
console.log(`Outro Worker: antes ${sonda.antes} | depois ${sonda.depois} | mesma API ${sonda.mesmaIdentidade}`);
console.log(`Registro da casa após Worker: ${registro.listarOrdens().length}`);
