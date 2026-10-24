import { ConselhoMediator } from "./conselho.js";
import { Barqueiros, Cultivadores, Guarda } from "./colegas.js";

export function montarConselho(falharAbertura: boolean = false) {
  const conselho = new ConselhoMediator();
  const barqueiros = new Barqueiros(conselho);
  const cultivadores = new Cultivadores(conselho);
  const guarda = new Guarda(conselho, falharAbertura);
  conselho.conectar({ barqueiros, cultivadores, guarda });
  return Object.freeze({ conselho, barqueiros, cultivadores, guarda });
}
