import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Parse KEY=value lines (same shape as `scripts/check-env.ts`). Exported for unit tests. */
export function parseDotenvLines(contents: string): Record<string, string> {
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

/**
 * Merge `.env` then `.env.local` and apply only keys missing from `process.env`
 * (shell / CI exports always win).
 */
export function loadPlaywrightEnvForPlaywright(): void {
  const root = process.cwd();
  const merged: Record<string, string> = {};
  for (const name of [
    ".env",
    ".env.local",
    ".env.beta.local",
    ".env.e2e.local",
    ".env.staging",
    ".env.staging.local",
  ] as const) {
    const p = join(root, name);
    if (!existsSync(p)) continue;
    Object.assign(merged, parseDotenvLines(readFileSync(p, "utf8")));
  }
  for (const [k, v] of Object.entries(merged)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}
