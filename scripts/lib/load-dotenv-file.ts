import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function parseDotenv(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
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
    out[key] = val;
  }
  return out;
}

/** Merge env files into process.env (does not log values). */
export function loadEnvFiles(
  paths: string[],
  cwd = process.cwd(),
  opts?: { skipEmptyInFile?: boolean },
): string[] {
  const loaded: string[] = [];
  for (const rel of paths) {
    const p = join(cwd, rel);
    if (!existsSync(p)) continue;
    const parsed = parseDotenv(readFileSync(p, "utf8"));
    for (const [k, v] of Object.entries(parsed)) {
      if (opts?.skipEmptyInFile && !v.trim()) continue;
      if (process.env[k] === undefined || process.env[k] === "") {
        process.env[k] = v;
      }
    }
    loaded.push(rel);
  }
  return loaded;
}

/**
 * Production checks: base from .env/.env.local, then non-empty overrides from .env.production.local.
 * Empty placeholders in .env.production.local do not mask real values in .env.local.
 */
/** Staging pilot: .env → .env.local → .env.staging.local (later wins). */
export function loadStagingPilotEnv(cwd = process.cwd()): string[] {
  const paths = [".env", ".env.local", ".env.staging.local"];
  const loaded: string[] = [];
  for (const rel of paths) {
    const p = join(cwd, rel);
    if (!existsSync(p)) continue;
    const parsed = parseDotenv(readFileSync(p, "utf8"));
    for (const [k, v] of Object.entries(parsed)) {
      if (!v.trim()) continue;
      process.env[k] = v;
    }
    loaded.push(rel);
  }
  return loaded;
}

export function loadProductionEnvLocal(cwd = process.cwd()): string[] {
  const a = loadEnvFiles([".env", ".env.local"], cwd, { skipEmptyInFile: true });
  const b = loadEnvFiles([".env.production.local"], cwd, { skipEmptyInFile: true });
  return [...new Set([...a, ...b])];
}
