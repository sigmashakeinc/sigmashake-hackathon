#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const required = [
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "AGENTS.md",
  "SPEC_SHEET.md",
  "docs/architecture.md",
  "docs/publishing/README.md",
  "docs/publishing/release-runner.yml",
  "docs/contributing/AI_AGENT_GUIDE.md",
  "docs/contributing/pull_request_template.md",
  "docs/contributing/bug_report.md",
  "docs/contributing/feature_request.md",
  "docs/contributing/CODEOWNERS.template",
  "docs/contributing/license-policy.md",
  "config/pr-gates.json",
  "packages/contracts/openapi.yaml"
];

const missing = [];
for (const relativePath of required) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    missing.push(relativePath);
  }
}

if (missing.length > 0) {
  console.error(`Publish check failed. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const gates = JSON.parse(await readFile(path.join(root, "config/pr-gates.json"), "utf8"));
const kinds = new Set(gates.gates.map((gate) => gate.kind));
const expected = [
  "unit",
  "integration",
  "component",
  "e2e",
  "regression",
  "api",
  "load",
  "stress",
  "spike",
  "soak",
  "scalability",
  "chaos",
  "failover",
  "dr",
  "configuration",
  "onboarding",
  "sast",
  "dast",
  "pen",
  "dependencies"
];

const missingKinds = expected.filter((kind) => !kinds.has(kind));
if (missingKinds.length > 0) {
  console.error(`Publish check failed. Missing gate kinds: ${missingKinds.join(", ")}`);
  process.exit(1);
}

const warnings = [];
try {
  await access(path.join(root, "package-lock.json"));
} catch {
  warnings.push("package-lock.json is missing; npm ci based release runners need the lockfile before they can pass");
}

console.log(JSON.stringify({
  status: warnings.length === 0 ? "publish-ready" : "publish-ready-with-warnings",
  requiredFiles: required.length,
  gateKinds: expected.length,
  warnings
}));
