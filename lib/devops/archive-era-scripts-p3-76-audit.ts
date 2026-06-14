import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ARCHIVE_ERA_SCRIPTS_P3_76_ARCHIVE_PATH,
  ARCHIVE_ERA_SCRIPTS_P3_76_ERA_PATTERN,
  ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS,
  ARCHIVE_ERA_SCRIPTS_P3_76_POLICY_ID,
  ARCHIVE_ERA_SCRIPTS_P3_76_WIRING_PATHS,
  ARCHIVE_ERA_SCRIPTS_P3_76_ARTIFACT,
} from "@/lib/devops/archive-era-scripts-p3-76-policy";
import {
  findRouterPrefixForScript,
  NPM_SCRIPT_ROUTER_PREFIXES,
} from "@/lib/devops/npm-script-consolidation-policy";
import { runArchiveEraScriptsBenchmarkP376 } from "@/lib/devops/archive-era-scripts-p3-76-scoring";

export type ArchiveEraScriptsP376AuditSummary = {
  policyId: typeof ARCHIVE_ERA_SCRIPTS_P3_76_POLICY_ID;
  wiringComplete: boolean;
  activeScriptCount: number;
  archivedScriptCount: number;
  eraInArchiveCount: number;
  eraInActiveCount: number;
  routerPrefixesPresent: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditArchiveEraScriptsP376(root = process.cwd()): ArchiveEraScriptsP376AuditSummary {
  const wiringComplete = ARCHIVE_ERA_SCRIPTS_P3_76_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  const activeScripts = Object.keys(pkg.scripts ?? {});
  const activeScriptCount = activeScripts.length;

  let archivedScriptCount = 0;
  let eraInArchiveCount = 0;
  const archivePath = join(root, ARCHIVE_ERA_SCRIPTS_P3_76_ARCHIVE_PATH);
  if (existsSync(archivePath)) {
    const archive = JSON.parse(readFileSync(archivePath, "utf8")) as {
      scripts?: Record<string, string>;
    };
    const keys = Object.keys(archive.scripts ?? {});
    archivedScriptCount = keys.length;
    eraInArchiveCount = keys.filter((key) => ARCHIVE_ERA_SCRIPTS_P3_76_ERA_PATTERN.test(key)).length;
  }

  const eraInActiveCount = activeScripts.filter((key) =>
    ARCHIVE_ERA_SCRIPTS_P3_76_ERA_PATTERN.test(key),
  ).length;

  const routerPrefixesPresent = NPM_SCRIPT_ROUTER_PREFIXES.every(
    (prefix) => pkg.scripts?.[prefix]?.includes("npm-script-router.ts"),
  );

  const sprawlInActive = activeScripts.filter((name) => {
    const prefix = findRouterPrefixForScript(name);
    return prefix !== null && name !== prefix;
  }).length;

  const benchmark = runArchiveEraScriptsBenchmarkP376({
    activeScriptCount,
    archivedScriptCount,
    eraInArchiveCount,
    eraInActiveCount,
    sprawlInActive,
    routerPrefixesPresent,
  });

  const artifactPresent = existsSync(join(root, ARCHIVE_ERA_SCRIPTS_P3_76_ARTIFACT));

  const passed =
    wiringComplete &&
    activeScriptCount < ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS &&
    eraInActiveCount === 0 &&
    sprawlInActive === 0 &&
    routerPrefixesPresent &&
    eraInArchiveCount > 0 &&
    benchmark.passed &&
    artifactPresent;

  return {
    policyId: ARCHIVE_ERA_SCRIPTS_P3_76_POLICY_ID,
    wiringComplete,
    activeScriptCount,
    archivedScriptCount,
    eraInArchiveCount,
    eraInActiveCount,
    routerPrefixesPresent,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatArchiveEraScriptsP376AuditLines(
  summary: ArchiveEraScriptsP376AuditSummary,
): string[] {
  return [
    `Archive era npm scripts (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Active scripts: ${summary.activeScriptCount} (max ${ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS})`,
    `Archived scripts: ${summary.archivedScriptCount}`,
    `Era scripts in archive: ${summary.eraInArchiveCount}`,
    `Era scripts in active: ${summary.eraInActiveCount}`,
    `Router prefixes: ${summary.routerPrefixesPresent ? "present" : "missing"}`,
    `Benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
