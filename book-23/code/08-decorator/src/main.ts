import type { Ataque } from "./contratos.js";
import { calcularPotenciaDireta } from "./direto.js";
import { Espada } from "./espada.js";
import { MantoAmplificador, MantoDeCalor } from "./mantos.js";

const espada = new Espada(10);
const somaAntesDeMultiplicar = new MantoAmplificador(new MantoDeCalor(espada, 3), 2);
const multiplicaAntesDeSomar = new MantoDeCalor(new MantoAmplificador(espada, 2), 3);
// Retirar é reconstruir outra composição, sem editar a já existente.
const somenteCalor = new MantoDeCalor(espada, 3);

for (const [nome, ataque] of [
  ["Núcleo", espada],
  ["Calor -> amplificação", somaAntesDeMultiplicar],
  ["Amplificação -> calor", multiplicaAntesDeSomar],
  ["Sem amplificador", somenteCalor],
] satisfies [string, Ataque][]) {
  const resultado = ataque.executar();
  console.log(`${nome}: ${resultado.potencia} | ${resultado.efeitos.join(" -> ")}`);
}
console.log(`Composição anterior preservada: ${somaAntesDeMultiplicar.executar().potencia}`);
console.log(`Fórmula direta (10 + 3) * 2: ${calcularPotenciaDireta(10, 3, 2)}`);
