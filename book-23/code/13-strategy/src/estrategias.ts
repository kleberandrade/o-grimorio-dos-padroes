import type { Alvo, EstrategiaDeAtaque, ResultadoAtaque } from "./contratos.js";
import { executado, inadequado, normalizarAlvo } from "./resultado.js";

export class AtaqueEspada implements EstrategiaDeAtaque {
  atacar(entrada: Alvo): ResultadoAtaque {
    const alvo = normalizarAlvo(entrada);
    if (alvo.distanciaMetros > 2) return inadequado("espada", alvo, "Fora do alcance de até 2 m.");
    if (alvo.resistencia === "reforcada") return inadequado("espada", alvo, "Resistência reforçada exige outra técnica.");
    return executado("espada", alvo, 1, "golpe próximo");
  }
}

export class AtaqueArco implements EstrategiaDeAtaque {
  atacar(entrada: Alvo): ResultadoAtaque {
    const alvo = normalizarAlvo(entrada);
    if (alvo.distanciaMetros < 2 || alvo.distanciaMetros > 30) return inadequado("arco", alvo, "Fora do intervalo de 2 a 30 m.");
    if (alvo.resistencia === "reforcada") return inadequado("arco", alvo, "Resistência reforçada exige outra técnica.");
    return executado("arco", alvo, 2, "disparo à distância");
  }
}

export class AtaqueMagia implements EstrategiaDeAtaque {
  atacar(entrada: Alvo): ResultadoAtaque {
    const alvo = normalizarAlvo(entrada);
    if (alvo.distanciaMetros > 15) return inadequado("magia", alvo, "Fora do alcance de até 15 m.");
    return executado("magia", alvo, 5, "pulso contra a resistência");
  }
}
