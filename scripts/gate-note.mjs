#!/usr/bin/env node
import { access } from "node:fs/promises";
import path from "node:path";

const [kind, ...requiredPaths] = process.argv.slice(2);
if (!kind) {
  console.error("usage: gate-note.mjs <kind> [required-file ...]");
  process.exit(2);
}

const root = path.resolve(new URL("..", import.meta.url).pathname);
const missing = [];
for (const requiredPath of requiredPaths) {
  try {
    await access(path.join(root, requiredPath));
  } catch {
    missing.push(requiredPath);
  }
}

if (missing.length > 0) {
  console.error(`${kind} gate is missing required files: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(JSON.stringify({
  gate: kind,
  status: "scaffold-verified",
  requiredPaths
}));
