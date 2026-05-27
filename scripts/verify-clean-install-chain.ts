#!/usr/bin/env node
/**
 * Non-destructive checks after `npm install` / `npm ci`.
 * Does not modify lockfiles or run npm install.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

let failed = false;

function ok(msg: string) {
  console.log(`OK  ${msg}`);
}

function warn(msg: string) {
  console.warn(`WARN ${msg}`);
}

function fail(msg: string) {
  console.error(`FAIL ${msg}`);
  failed = true;
}

function checkPathExists(relPath: string, label: string) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) {
    fail(`${label} missing at ${relPath}`);
  } else {
    ok(`${label} present`);
  }
}

function checkPaths(paths: Array<{ relPath: string; label: string }>) {
  for (const entry of paths) {
    checkPathExists(entry.relPath, entry.label);
  }
}

const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { scripts?: Record<string, string> };
const post = pkg.scripts?.postinstall ?? "";
if (!post.includes("ensure-object-inspect-shim")) {
  warn("package.json postinstall does not reference ensure-object-inspect-shim.cjs");
} else {
  ok("postinstall references object-inspect shim script");
}

const shimScript = path.join(root, "scripts", "ensure-object-inspect-shim.cjs");
if (!fs.existsSync(shimScript)) {
  fail("scripts/ensure-object-inspect-shim.cjs missing");
} else {
  ok("shim script file exists");
}

const shimTarget = path.join(root, "node_modules", "object-inspect", "util.inspect.js");
if (!fs.existsSync(path.join(root, "node_modules"))) {
  warn("node_modules not present — skip object-inspect shim file check (run after install)");
} else if (!fs.existsSync(shimTarget)) {
  warn("node_modules/object-inspect/util.inspect.js not present yet — postinstall should create it on full install");
} else {
  ok("object-inspect util.inspect shim present");
}

try {
  require.resolve("qs", { paths: [root] });
  ok("qs resolvable");
} catch {
  fail("qs not resolvable from project root");
}

try {
  require.resolve("stripe", { paths: [root] });
  ok("stripe resolvable");
} catch {
  fail("stripe not resolvable from project root");
}

/** Runtime + typecheck-critical packages (catch partial/corrupt node_modules before typecheck). */
const criticalPackages = ["date-fns", "zustand", "next", "typescript"] as const;
for (const name of criticalPackages) {
  try {
    require.resolve(`${name}/package.json`, { paths: [root] });
    ok(`${name} package manifest resolvable`);
  } catch {
    fail(`${name} not resolvable from project root — run npm ci`);
  }
}

checkPaths([
  { relPath: "node_modules/vitest/vitest.mjs", label: "Vitest CLI entrypoint" },
  { relPath: "node_modules/vitest/suppress-warnings.cjs", label: "Vitest suppress-warnings preload" },
  { relPath: "node_modules/vitest/package.json", label: "Vitest package manifest" },
  { relPath: "node_modules/chai/package.json", label: "Chai package manifest (Vitest expect)" },
  { relPath: "node_modules/vitest/dist/module-evaluator.js", label: "Vitest module evaluator" },
  { relPath: "node_modules/pathe/package.json", label: "Pathe package manifest" },
  {
    relPath: "node_modules/vitest/node_modules/picomatch/lib/scan.js",
    label: "Vitest nested picomatch scan helper",
  },
  { relPath: "node_modules/vite/package.json", label: "Vite package manifest" },
  { relPath: "node_modules/rollup/package.json", label: "Rollup package manifest" },
  { relPath: "node_modules/postcss/package.json", label: "PostCSS package manifest" },
  { relPath: "node_modules/picomatch/package.json", label: "Top-level picomatch package manifest" },
  { relPath: "node_modules/std-env/package.json", label: "std-env package manifest" },
  { relPath: "node_modules/tinyrainbow/package.json", label: "tinyrainbow package manifest" },
  { relPath: "node_modules/tinybench/package.json", label: "tinybench package manifest" },
  { relPath: "node_modules/tinyexec/package.json", label: "tinyexec package manifest" },
  { relPath: "node_modules/tinyglobby/package.json", label: "tinyglobby package manifest" },
  { relPath: "node_modules/obug/package.json", label: "obug package manifest" },
  { relPath: "node_modules/magic-string/package.json", label: "magic-string package manifest" },
  { relPath: "node_modules/expect-type/package.json", label: "expect-type package manifest" },
  { relPath: "node_modules/es-module-lexer/package.json", label: "es-module-lexer package manifest" },
  { relPath: "node_modules/estree-walker/package.json", label: "estree-walker package manifest" },
  {
    relPath: "node_modules/convert-source-map/package.json",
    label: "convert-source-map package manifest",
  },
]);

if (failed) {
  process.exit(1);
}
