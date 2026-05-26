#!/usr/bin/env node
/**
 * Non-destructive checks after `npm install` / `npm ci`.
 * Does not modify lockfiles or run npm install.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");
const require = createRequire(import.meta.url);

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

if (failed) {
  process.exit(1);
}
