#!/usr/bin/env node
/**
 * "Catraca" de qualidade: o projeto tem erros antigos de tipo e de lint. Em vez de travar tudo, o CI compara com a
 * linha de base (.ci/baseline.json) e FALHA se algo PIOROU. Quando melhorar, o script avisa para baixar a linha de base.
 *
 * Uso: node scripts/ci/ratchet.js            (confere)
 *      node scripts/ci/ratchet.js --update   (grava a linha de base atual)
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const BASELINE = path.join(__dirname, "..", "..", ".ci", "baseline.json");

function run(cmd, args) {
  return spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function tscErrors() {
  const r = run("npx", ["--no-install", "tsc", "--noEmit", "--pretty", "false"]);
  return (`${r.stdout}${r.stderr}`.match(/error TS\d+/g) || []).length;
}

function eslintCounts() {
  const r = run("npx", ["--no-install", "eslint", ".", "-f", "json"]);
  let results;
  try {
    results = JSON.parse(r.stdout);
  } catch {
    console.error("Não foi possível ler a saída do ESLint:\n" + r.stderr.slice(0, 2000));
    process.exit(2);
  }
  return results.reduce(
    (acc, f) => ({ errors: acc.errors + f.errorCount, warnings: acc.warnings + f.warningCount }),
    { errors: 0, warnings: 0 },
  );
}

const lint = eslintCounts();
const current = { tsc: tscErrors(), eslintErrors: lint.errors, eslintWarnings: lint.warnings };

if (process.argv.includes("--update")) {
  fs.writeFileSync(BASELINE, JSON.stringify(current, null, 2) + "\n");
  console.log("Linha de base gravada:", current);
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
const labels = { tsc: "Erros de tipo (tsc)", eslintErrors: "Erros de lint", eslintWarnings: "Avisos de lint" };
let worse = false;
let better = false;
for (const key of Object.keys(labels)) {
  const delta = current[key] - baseline[key];
  const mark = delta > 0 ? "✖ PIOROU" : delta < 0 ? "✔ melhorou" : "= igual";
  console.log(`${labels[key].padEnd(22)} base ${String(baseline[key]).padStart(3)}  agora ${String(current[key]).padStart(3)}  ${mark}`);
  if (delta > 0) worse = true;
  if (delta < 0) better = true;
}
if (worse) {
  console.error("\nO PR introduziu novos erros. Corrija-os (não aumente a linha de base).");
  process.exit(1);
}
if (better) {
  console.log("\nÓtimo! Melhorou: rode `node scripts/ci/ratchet.js --update` e commite .ci/baseline.json para travar o ganho.");
}
