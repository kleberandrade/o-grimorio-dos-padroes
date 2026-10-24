import type { Registro } from "./contratos.js";
import { EquipeDeComportas } from "./equipe.js";

export function montarCasaDeControle(registro: Registro) {
  return {
    registro,
    equipeSul: new EquipeDeComportas(registro, "Sul", "dia"),
    equipeNorte: new EquipeDeComportas(registro, "Norte", "dia"),
  };
}
