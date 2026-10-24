#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const book = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const code = path.join(book, "code");
const names = readdirSync(code).filter((name) => /^\d{2}-[a-z-]+$/.test(name)
  && existsSync(path.join(code, name, "package.json"))).sort();
const [id, action = "check"] = process.argv.slice(2);
const name = names.find((item) => item === id || item.slice(0, 2) === id?.padStart(2, "0"));
if (!name || !["install", "check", "run", "solution", "capture", "verify"].includes(action)) {
  console.error("Uso: node book-23/scripts/projetos.mjs <01|nome> <install|check|run|solution|capture|verify>");
  console.error(`Implementados: ${names.join(", ")}`);
  process.exit(1);
}
const project = path.join(code, name);
const declared = JSON.parse(readFileSync(path.join(project, "package.json"), "utf8"));
if (process.versions.node !== declared.engines.node) {
  console.error(`Runtime divergente: esperado Node ${declared.engines.node}; obtido ${process.versions.node}.`);
  process.exit(1);
}

function exec(command, args, capture = false) {
  const result = spawnSync(command, args, {
    cwd: project,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (capture) process.stderr.write((result.stdout ?? "") + (result.stderr ?? ""));
    throw new Error(`Falha (${result.status}): ${command} ${args.join(" ")}`);
  }
  return result.stdout ?? "";
}
function inputs(dir = project) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", "dist", "evidence"].includes(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? inputs(full) : [full];
  }).sort();
}
function digest(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

try {
  if (action === "install") {
    exec("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
  } else if (action === "check") {
    exec("npm", ["test"]);
  } else if (action === "run" || action === "solution") {
    exec("npm", ["run", action === "run" ? "start" : "solution"]);
  } else {
    // Testa e compila somente este projeto: não concatena snippets nem depende de vizinhos.
    const testOutput = exec("npm", ["test"], true);
    const stdout = exec(process.execPath, ["dist/src/main.js"], true);
    const solution = exec(process.execPath, ["dist/solution/main.js"], true);
    const evidence = path.join(project, "evidence");
    const hashes = Object.fromEntries(inputs().map((file) => [path.relative(project, file), digest(file)]));
    if (action === "capture") {
      mkdirSync(evidence, { recursive: true });
      writeFileSync(path.join(evidence, "stdout.txt"), stdout);
      writeFileSync(path.join(evidence, "solution-stdout.txt"), solution);
      writeFileSync(path.join(evidence, "tests.txt"), testOutput);
      writeFileSync(path.join(evidence, "manifest.json"), JSON.stringify({
        capturedAt: new Date().toISOString(),
        command: `node book-23/scripts/projetos.mjs ${name} capture`,
        node: process.versions.node,
        npm: exec("npm", ["--version"], true).trim(),
        typescript: exec(process.execPath, ["node_modules/typescript/bin/tsc", "--version"], true).trim(),
        inputs: hashes,
        outputs: Object.fromEntries(["stdout.txt", "solution-stdout.txt", "tests.txt"]
          .map((file) => [file, digest(path.join(evidence, file))])),
      }, null, 2) + "\n");
      console.log(`Evidências reais gravadas em ${path.relative(book, evidence)}.`);
    } else {
      const manifest = JSON.parse(readFileSync(path.join(evidence, "manifest.json"), "utf8"));
      if (JSON.stringify(manifest.inputs) !== JSON.stringify(hashes)) throw new Error("Fontes mudaram desde a captura; revisar e capturar novamente.");
      for (const [file, hash] of Object.entries(manifest.outputs)) {
        if (digest(path.join(evidence, file)) !== hash) throw new Error(`Evidência alterada: ${file}`);
      }
      if (readFileSync(path.join(evidence, "stdout.txt"), "utf8") !== stdout
        || readFileSync(path.join(evidence, "solution-stdout.txt"), "utf8") !== solution) {
        throw new Error("Saída executada diverge da saída preservada.");
      }
      console.log("Fontes e evidências íntegras; testes e saídas reproduzidos.");
    }
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
