#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const workflowsDir = path.join(root, ".github", "workflows");
const packageJsonPath = path.join(root, "package.json");
const archivePath = path.join(root, "config/npm-scripts/archive-v1.json");

const ROUTER_PREFIXES = [
  "test:ci",
  "ops",
  "smoke",
  "audit",
  "workspace",
  "storefront",
  "beta",
  "staging",
  "pilot",
  "verify",
  "validate",
  "cert",
];

type PackageJson = {
  scripts?: Record<string, string>;
};

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;
const scripts = pkg.scripts ?? {};

let archivedScripts = {};
if (fs.existsSync(archivePath)) {
  const archive = JSON.parse(fs.readFileSync(archivePath, "utf8")) as {
    scripts?: Record<string, string>;
  };
  archivedScripts = archive.scripts ?? {};
}

let failed = false;

function ok(message: string) {
  console.log(`OK  ${message}`);
}

function fail(message: string) {
  console.error(`FAIL ${message}`);
  failed = true;
}

function scriptExists(scriptName: string): boolean {
  if (scripts[scriptName]) return true;
  if (archivedScripts[scriptName]) return true;
  return false;
}

function extractReferencedScripts(source: string): Set<string> {
  const out = new Set<string>();

  for (const match of source.matchAll(/\bnpm run ([A-Za-z0-9:_-]+)(?: -- ([^\n]+))?/g)) {
    const prefix = match[1];
    const restRaw = match[2]?.trim();
    const rest = restRaw?.split(/\s+/)[0];
    if (rest && ROUTER_PREFIXES.includes(prefix) && !rest.startsWith("-")) {
      if (rest.includes("${{")) {
        const patternPrefix = `test:ci:${rest.split("${{")[0]}`;
        const hasDynamicMatch = Object.keys(archivedScripts).some((key) =>
          key.startsWith(patternPrefix),
        );
        if (hasDynamicMatch) {
          out.add(`${patternPrefix}*`);
        } else {
          out.add(`${prefix}:${rest}`);
        }
      } else {
        out.add(`${prefix}:${rest}`);
      }
    } else {
      out.add(prefix);
    }
  }

  if (/\bnpm test\b/.test(source)) {
    out.add("test");
  }

  return out;
}

function scriptResolvable(scriptName: string): boolean {
  if (scriptExists(scriptName)) return true;
  if (scriptName.endsWith("*")) {
    const prefix = scriptName.slice(0, -1);
    return Object.keys(archivedScripts).some((key) => key.startsWith(prefix));
  }
  return false;
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
    if (!scriptResolvable(scriptName)) {
      fail(`${file} references missing script "${scriptName}"`);
    } else {
      ok(`${file} references resolvable script "${scriptName}"`);
    }
  }
}

if (failed) {
  process.exit(1);
}
