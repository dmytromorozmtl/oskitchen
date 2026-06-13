/**
 * Consolidate npm scripts: archive sprawl prefixes, keep essentials + routers (<200).
 *
 * Usage:
 *   tsx scripts/consolidate-npm-scripts.ts
 *   tsx scripts/consolidate-npm-scripts.ts --write
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  NPM_SCRIPT_ARCHIVE_PATH,
  NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS,
  NPM_SCRIPT_CONSOLIDATION_POLICY_ID,
  NPM_SCRIPT_CONSOLIDATION_SUMMARY_ARTIFACT,
  NPM_SCRIPT_ESSENTIAL_PATH,
  NPM_SCRIPT_ROUTER_PREFIXES,
  findRouterPrefixForScript,
} from "@/lib/devops/npm-script-consolidation-policy";

const ROOT = process.cwd();
const packageJsonPath = join(ROOT, "package.json");

type PackageJson = {
  scripts?: Record<string, string>;
  [key: string]: unknown;
};

function buildRouterEntries(): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const prefix of NPM_SCRIPT_ROUTER_PREFIXES) {
    entries[prefix] = `tsx scripts/npm-script-router.ts ${prefix}`;
  }
  return entries;
}

function main(): void {
  const write = process.argv.includes("--write");
  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJson;
  const allScripts = pkg.scripts ?? {};

  const archive: Record<string, string> = {};
  const essential: Record<string, string> = {};
  const routers = buildRouterEntries();

  for (const [name, command] of Object.entries(allScripts)) {
    if (findRouterPrefixForScript(name)) {
      archive[name] = command;
    } else {
      essential[name] = command;
    }
  }

  const nextScripts = { ...essential, ...routers };
  const nextCount = Object.keys(nextScripts).length;

  const summary = {
    policyId: NPM_SCRIPT_CONSOLIDATION_POLICY_ID,
    generatedAt: new Date().toISOString(),
    beforeTotal: Object.keys(allScripts).length,
    afterTotal: nextCount,
    archivedTotal: Object.keys(archive).length,
    essentialTotal: Object.keys(essential).length,
    routerTotal: Object.keys(routers).length,
    maxScripts: NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS,
    passed: nextCount < NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!write) {
    console.log("[consolidate-npm-scripts] dry-run — pass --write to apply");
    if (!summary.passed) process.exit(1);
    return;
  }

  mkdirSync(dirname(join(ROOT, NPM_SCRIPT_ARCHIVE_PATH)), { recursive: true });
  writeFileSync(
    join(ROOT, NPM_SCRIPT_ARCHIVE_PATH),
    `${JSON.stringify({ version: 1, scripts: archive }, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    join(ROOT, NPM_SCRIPT_ESSENTIAL_PATH),
    `${JSON.stringify({ version: 1, scripts: essential }, null, 2)}\n`,
    "utf8",
  );

  pkg.scripts = nextScripts;
  writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");

  mkdirSync(dirname(join(ROOT, NPM_SCRIPT_CONSOLIDATION_SUMMARY_ARTIFACT)), {
    recursive: true,
  });
  writeFileSync(
    join(ROOT, NPM_SCRIPT_CONSOLIDATION_SUMMARY_ARTIFACT),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );

  console.log(`[consolidate-npm-scripts] archive → ${NPM_SCRIPT_ARCHIVE_PATH}`);
  console.log(`[consolidate-npm-scripts] package.json scripts: ${nextCount}`);

  if (!summary.passed) {
    console.error("[consolidate-npm-scripts] FAIL — still above max script count");
    process.exit(1);
  }

  console.log("[consolidate-npm-scripts] PASS");
}

main();
