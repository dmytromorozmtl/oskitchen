#!/usr/bin/env node
/**
 * Guard for npm run test:e2e:pilot:http
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function parseDotenv(contents) {
  const out = {};
  for (const line of contents.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (v) out[t.slice(0, eq).trim()] = v;
  }
  return out;
}

const cwd = process.cwd();
const merged = {};
for (const f of [".env", ".env.local", ".env.staging", ".env.staging.local"]) {
  const p = join(cwd, f);
  if (!existsSync(p)) continue;
  Object.assign(merged, parseDotenv(readFileSync(p, "utf8")));
}

const base =
  process.env.PLAYWRIGHT_BASE_URL?.trim() ||
  merged.PLAYWRIGHT_BASE_URL?.trim() ||
  merged.NEXT_PUBLIC_APP_URL?.trim() ||
  "";

if (!base) {
  console.error(`HTTP pilot E2E requires a staging URL:

  export PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app
  npm run test:e2e:pilot:http

Or add PLAYWRIGHT_BASE_URL=... to .env.staging.local
`);
  process.exit(1);
}

try {
  const u = new URL(base);
  if (!u.protocol.startsWith("http")) throw new Error("bad protocol");
} catch {
  console.error(`Invalid PLAYWRIGHT_BASE_URL / NEXT_PUBLIC_APP_URL: ${base}`);
  process.exit(1);
}

if (base.includes("YOUR-PREVIEW")) {
  console.error("Replace placeholder YOUR-PREVIEW.vercel.app with a live deployment URL.");
  process.exit(1);
}

process.env.PLAYWRIGHT_BASE_URL = base.replace(/\/$/, "");
console.log(`E2E HTTP base: ${process.env.PLAYWRIGHT_BASE_URL}`);
