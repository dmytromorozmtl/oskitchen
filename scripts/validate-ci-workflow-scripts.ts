#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const workflowsDir = path.join(root, ".github", "workflows");
const packageJsonPath = path.join(root, "package.json");

type PackageJson = {
  scripts?: Record<string, string>;
};

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;
const scripts = pkg.scripts ?? {};

let failed = false;

function ok(message: string) {
  console.log(`OK  ${message}`);
}

function fail(message: string) {
  console.error(`FAIL ${message}`);
  failed = true;
}

function extractReferencedScripts(source: string): Set<string> {
  const out = new Set<string>();

  for (const match of source.matchAll(/\bnpm run ([A-Za-z0-9:_-]+)/g)) {
    out.add(match[1]);
  }

  if (/\bnpm test\b/.test(source)) {
    out.add("test");
  }

  return out;
}

const workflowFiles = fs
  .readdirSync(workflowsDir)
  .filter((entry) => entry.endsWith(".yml") || entry.endsWith(".yaml"))
  .sort();

for (const file of workflowFiles) {
  const fullPath = path.join(workflowsDir, file);
  const content = fs.readFileSync(fullPath, "utf8");
  const referenced = [...extractReferencedScripts(content)].sort();
  if (referenced.length === 0) continue;

  for (const scriptName of referenced) {
    if (!scripts[scriptName]) {
      fail(`${file} references missing package.json script "${scriptName}"`);
    } else {
      ok(`${file} references existing script "${scriptName}"`);
    }
  }
}

if (failed) {
  process.exit(1);
}
