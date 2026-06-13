/**
 * Run archived npm scripts by router prefix.
 *
 * Usage:
 *   npm run test:ci -- p0-staging-proof-unblock-era17
 *   npm run ops -- run-p0-staging-proof-execution
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  NPM_SCRIPT_ARCHIVE_PATH,
  resolveArchivedScriptKey,
} from "@/lib/devops/npm-script-consolidation-policy";

const ROOT = process.cwd();

function loadArchive(): Record<string, string> {
  const raw = readFileSync(join(ROOT, NPM_SCRIPT_ARCHIVE_PATH), "utf8");
  const parsed = JSON.parse(raw) as { scripts?: Record<string, string> };
  return parsed.scripts ?? parsed;
}

function main(): void {
  const routerPrefix = process.argv[2]?.trim();
  const rest = process.argv.slice(3).join(":").trim();

  if (!routerPrefix) {
    console.error("[npm-script-router] missing router prefix (e.g. test:ci, ops, smoke)");
    process.exit(1);
  }

  const key = resolveArchivedScriptKey(routerPrefix, rest);
  const archive = loadArchive();
  const command = archive[key];

  if (!command) {
    console.error(`[npm-script-router] archived script not found: ${key}`);
    process.exit(1);
  }

  console.log(`[npm-script-router] ${key}`);
  execSync(command, { cwd: ROOT, stdio: "inherit", env: process.env, shell: true });
}

main();
