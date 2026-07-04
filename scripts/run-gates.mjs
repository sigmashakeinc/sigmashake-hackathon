#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const manifestPath = path.join(root, "config", "pr-gates.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const args = process.argv.slice(2);

function argValue(name) {
  const prefix = `${name}=`;
  const direct = args.indexOf(name);
  if (direct >= 0) return args[direct + 1];
  const pair = args.find((arg) => arg.startsWith(prefix));
  return pair ? pair.slice(prefix.length) : undefined;
}

const list = args.includes("--list");
const skipHeavy = args.includes("--skip-heavy");
const gateName = argValue("--gate");
const categoryName = argValue("--category");

if (list) {
  for (const gate of manifest.gates) {
    const marker = gate.heavy ? "heavy" : "standard";
    console.log(`${gate.kind}\t${gate.category}\t${marker}\t${gate.description}`);
  }
  process.exit(0);
}

let selected = manifest.gates;
if (gateName) selected = selected.filter((gate) => gate.kind === gateName);
if (categoryName) selected = selected.filter((gate) => gate.category === categoryName);
if (skipHeavy) selected = selected.filter((gate) => !gate.heavy);

if (selected.length === 0) {
  console.error(`No gates matched gate=${gateName ?? "*"} category=${categoryName ?? "*"}`);
  process.exit(1);
}

for (const gate of selected) {
  console.log(`\n== ${gate.kind}: ${gate.description}`);
  for (const command of gate.commands) {
    await run(command);
  }
}

async function run(command) {
  console.log(`$ ${command}`);
  const child = spawn(command, {
    cwd: root,
    env: process.env,
    shell: true,
    stdio: "inherit"
  });

  const code = await new Promise((resolve) => {
    child.on("exit", resolve);
  });

  if (code !== 0) {
    console.error(`Command failed with exit code ${code}: ${command}`);
    process.exit(code ?? 1);
  }
}
