#!/usr/bin/env node
/**
 * Print shell-safe exports from staging env files (for bash `eval`).
 * Later files override earlier. Skips empty values.
 *
 *   eval "$(node scripts/ops/export-staging-env.mjs)"
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function parseDotenv(contents) {
  const out = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val) out[key] = val;
  }
  return out;
}

const cwd = process.cwd();
const files = [".env", ".env.local", ".env.staging", ".env.staging.local"];
const merged = {};

for (const rel of files) {
  const p = join(cwd, rel);
  if (!existsSync(p)) continue;
  Object.assign(merged, parseDotenv(readFileSync(p, "utf8")));
}

for (const [key, val] of Object.entries(merged)) {
  const safe = val.replace(/'/g, `'\\''`);
  process.stdout.write(`export ${key}='${safe}'\n`);
}
