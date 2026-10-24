import { Diario } from "./diario.js";
import { GuardiaoDasMemorias } from "./guardiao.js";

// Alternativa simples, suficiente para um único valor sem encapsulamento entre papéis.
let valorAtivo = "Anotação simples inicial.";
const valorGuardado = valorAtivo;
valorAtivo = "Rascunho posterior.";
const antesDaCopiaDireta = valorAtivo;
valorAtivo = valorGuardado;
console.log(`Valor direto: ${antesDaCopiaDireta} -> ${valorAtivo}`);
const diario = new Diario({ conteudo: "A testemunha indicou o arquivo norte.",
  contexto: { local: "Chronoria", marcadores: ["depoimento"] } });
const guardiao = new GuardiaoDasMemorias(2);
guardiao.adicionar(diario.salvar(), "Depoimento inicial");
diario.substituir({ conteudo: "Anotação pessoal posterior.", contexto: { local: "Sala do diário", marcadores: ["pessoal"] } });
const copiaSeparada = diario.ler();
console.log(`Antes: ${diario.ler().conteudo}`);
console.log(`Guardião: ${guardiao.listar()[0]!.rotulo}`);
console.log(`Campos no token: ${Reflect.ownKeys(guardiao.obter(0)).length}`);
diario.restaurar(guardiao.obter(0));
console.log(`Restaurado: ${diario.ler().conteudo}`);
console.log(`Contexto restaurado: ${diario.ler().contexto.local} | ${diario.ler().contexto.marcadores.join(", ")}`);
console.log(`Cópia separada: ${copiaSeparada.conteudo}`);
