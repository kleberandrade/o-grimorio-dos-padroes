import type { RegistroAcao } from "./contratos.js";
import { Guerreiro } from "./guerreiro.js";

const dario = new Guerreiro("Dário");
const imprimir = (registro: RegistroAcao): void => {
  console.log(`${registro.acao}: ${registro.executada ? "executada" : "recusada"} | ${registro.antes} -> ${registro.depois} | fúria restante ${registro.intervalosFuriaRestantes}`);
};
console.log(`Vigia: ${dario.nome}`);
imprimir(dario.atacar());
imprimir(dario.atacar());
imprimir(dario.atacar());
imprimir(dario.atacar());
imprimir(dario.descansar({ protegido: false }));
imprimir(dario.descansar({ protegido: true }));
console.log(`Ataques executados no histórico: ${dario.listarHistorico().filter((registro) => registro.acao === "atacar" && registro.executada).length}`);
