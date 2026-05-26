#!/usr/bin/env node
// One-shot helper: rewrite DIRECT_URL in .env and .env.local to the
// Supabase Session Pooler (port 5432 on aws-0-<region>.pooler.supabase.com),
// derived from the existing DATABASE_URL (transaction pooler on :6543).
//
// Safety:
//   - Never prints connection strings, usernames, or passwords.
//   - Writes a `.bak.<timestamp>` backup of each file before mutating.
//   - No-op if DIRECT_URL is already on the Session Pooler.
//   - Refuses to run if DATABASE_URL is missing or not a Supabase pooler URL.
//   - Only edits the DIRECT_URL= line; all other content is preserved verbatim.

import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const FILES = [".env", ".env.local"];

/** Parse a single env file's KEY=VALUE pairs (quoted or not). Comments + blanks ignored. */
function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimStart();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/** Build the Session Pooler URL from a transaction pooler URL. Returns null on bad shape. */
function deriveSessionPoolerUrl(transactionUrl) {
  let u;
  try {
    u = new URL(transactionUrl);
  } catch {
    return null;
  }
  if (!u.hostname.endsWith(".pooler.supabase.com")) return null;
  if (u.port !== "6543") return null;
  u.port = "5432";
  // Session pooler does not need pgbouncer=true (that flag tells Prisma to skip
  // prepared statements for transaction-mode pgbouncer). Strip it.
  u.searchParams.delete("pgbouncer");
  // connection_limit / pool_timeout are fine to keep but unnecessary for migrate.
  return u.toString();
}

function classify(raw) {
  if (!raw) return "missing";
  try {
    const u = new URL(raw);
    if (u.hostname.endsWith(".pooler.supabase.com") && u.port === "6543")
      return "supabase-transaction-pooler";
    if (u.hostname.endsWith(".pooler.supabase.com") && u.port === "5432")
      return "supabase-session-pooler";
    if (/^db\.[a-z0-9]+\.supabase\.co$/i.test(u.hostname) && u.port === "5432")
      return "supabase-direct-legacy-ipv6";
    return `other:${u.port || "?"}`;
  } catch {
    return "unparseable";
  }
}

/** Replace the `DIRECT_URL=` line in-place. Adds the key at the end if missing. */
function replaceDirectUrlLine(text, newValue) {
  const lines = text.split(/\r?\n/);
  let replaced = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*DIRECT_URL\s*=/.test(lines[i])) {
      lines[i] = `DIRECT_URL="${newValue}"`;
      replaced = true;
      break;
    }
  }
  if (!replaced) lines.push(`DIRECT_URL="${newValue}"`);
  return lines.join("\n");
}

function backup(path) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${path}.bak.${ts}`;
  copyFileSync(path, backupPath);
  return backupPath;
}

let mutated = 0;
let skipped = 0;
let abort = false;

for (const name of FILES) {
  const path = resolve(ROOT, name);
  if (!existsSync(path)) {
    console.log(`• ${name}: missing — skipping`);
    skipped++;
    continue;
  }

  const raw = readFileSync(path, "utf8");
  const parsed = parseEnv(raw);
  const before = classify(parsed.DIRECT_URL);
  const dbShape = classify(parsed.DATABASE_URL);

  console.log(`• ${name}: DATABASE_URL=${dbShape} | DIRECT_URL(before)=${before}`);

  if (before === "supabase-session-pooler") {
    console.log(`  ✓ already on Session Pooler — no change.`);
    skipped++;
    continue;
  }

  if (dbShape !== "supabase-transaction-pooler") {
    console.log(
      `  ✗ DATABASE_URL is not a Supabase transaction pooler URL — refusing to derive DIRECT_URL automatically.`,
    );
    abort = true;
    continue;
  }

  const next = deriveSessionPoolerUrl(parsed.DATABASE_URL);
  if (!next) {
    console.log(`  ✗ could not derive Session Pooler URL from DATABASE_URL.`);
    abort = true;
    continue;
  }

  const backupPath = backup(path);
  const updated = replaceDirectUrlLine(raw, next);
  writeFileSync(path, updated);
  const after = classify(next);
  console.log(`  ✓ rewrote DIRECT_URL to ${after} (backup: ${backupPath.replace(ROOT + "/", "")})`);
  mutated++;
}

console.log("");
console.log(`Result: ${mutated} file(s) updated, ${skipped} unchanged.`);
if (abort) {
  console.log(
    "One or more files were skipped because their DATABASE_URL was not a Supabase transaction pooler URL. Fix manually and re-run.",
  );
  process.exit(2);
}
