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

checkPathExists("node_modules/vitest/vitest.mjs", "Vitest CLI entrypoint");
checkPathExists("node_modules/vitest/package.json", "Vitest package manifest");
checkPathExists("node_modules/pathe/package.json", "Pathe package manifest");
checkPathExists(
  "node_modules/vitest/node_modules/picomatch/lib/scan.js",
  "Vitest nested picomatch scan helper",
);

if (failed) {
  process.exit(1);
}
