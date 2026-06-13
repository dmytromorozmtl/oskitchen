/**
 * Audit npm script surface — baseline + post-consolidation counts.
 *
 * Usage:
 *   tsx scripts/audit-npm-script-surface.ts
 *   tsx scripts/audit-npm-script-surface.ts --write
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  NPM_SCRIPT_ARCHIVE_PATH,
  NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS,
  NPM_SCRIPT_CONSOLIDATION_POLICY_ID,
  NPM_SCRIPT_ROUTER_PREFIXES,
  NPM_SCRIPT_SURFACE_ARTIFACT,
  findRouterPrefixForScript,
} from "@/lib/devops/npm-script-consolidation-policy";

const ROOT = process.cwd();

function countByPrefix(names: string[]): Record<string, number> {
  const counts: Record<string, number> = { essential: 0 };
  for (const prefix of NPM_SCRIPT_ROUTER_PREFIXES) {
    counts[prefix] = 0;
  }

  for (const name of names) {
    const router = findRouterPrefixForScript(name);
    if (router) counts[router] = (counts[router] ?? 0) + 1;
    else counts.essential = (counts.essential ?? 0) + 1;
  }

  return counts;
}

function main(): void {
  const write = process.argv.includes("--write");
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  const packageScripts = Object.keys(pkg.scripts ?? {});

  let archivedScripts: string[] = [];
  if (existsSync(join(ROOT, NPM_SCRIPT_ARCHIVE_PATH))) {
    const archive = JSON.parse(readFileSync(join(ROOT, NPM_SCRIPT_ARCHIVE_PATH), "utf8")) as {
      scripts?: Record<string, string>;
    };
    archivedScripts = Object.keys(archive.scripts ?? {});
  }

  const summary = {
    policyId: NPM_SCRIPT_CONSOLIDATION_POLICY_ID,
    generatedAt: new Date().toISOString(),
    packageScriptCount: packageScripts.length,
    archivedScriptCount: archivedScripts.length,
    totalResolvable: packageScripts.length + archivedScripts.length,
    maxScripts: NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS,
    packageByPrefix: countByPrefix(packageScripts),
    archivedByPrefix: countByPrefix(archivedScripts),
    passed: packageScripts.length < NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (write) {
    mkdirSync(dirname(join(ROOT, NPM_SCRIPT_SURFACE_ARTIFACT)), { recursive: true });
    writeFileSync(
      join(ROOT, NPM_SCRIPT_SURFACE_ARTIFACT),
      `${JSON.stringify(summary, null, 2)}\n`,
      "utf8",
    );
    console.log(`[audit-npm-script-surface] artifact → ${NPM_SCRIPT_SURFACE_ARTIFACT}`);
  }

  if (!summary.passed) process.exit(1);
}

main();
