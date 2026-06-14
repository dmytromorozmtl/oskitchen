import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ARCHIVE_WORKFLOWS_P3_77_ARTIFACT,
  ARCHIVE_WORKFLOWS_P3_77_POLICY_ID,
  ARCHIVE_WORKFLOWS_P3_77_WIRING_PATHS,
} from "@/lib/devops/archive-workflows-p3-77-policy";
import { runArchiveWorkflowsBenchmarkP377 } from "@/lib/devops/archive-workflows-p3-77-scoring";
import {
  GITHUB_WORKFLOW_ACTIVE_ALLOWLIST,
  GITHUB_WORKFLOW_ACTIVE_DIR,
  GITHUB_WORKFLOW_ARCHIVE_DIR,
  shouldArchiveWorkflow,
} from "@/lib/devops/github-workflow-archive-policy";

const ERA_PATTERN = /era25|ops-era/i;

export type ArchiveWorkflowsP377AuditSummary = {
  policyId: typeof ARCHIVE_WORKFLOWS_P3_77_POLICY_ID;
  wiringComplete: boolean;
  activeCount: number;
  archivedCount: number;
  eraInActiveCount: number;
  eraInArchivedCount: number;
  allowlistComplete: boolean;
  nonCanonicalActiveCount: number;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

function listWorkflows(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"));
}

export function auditArchiveWorkflowsP377(root = process.cwd()): ArchiveWorkflowsP377AuditSummary {
  const wiringComplete = ARCHIVE_WORKFLOWS_P3_77_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  const activeDir = join(root, GITHUB_WORKFLOW_ACTIVE_DIR);
  const archiveDir = join(root, GITHUB_WORKFLOW_ARCHIVE_DIR);
  const active = listWorkflows(activeDir);
  const archived = listWorkflows(archiveDir);

  const eraInActiveCount = active.filter((name) => ERA_PATTERN.test(name)).length;
  const eraInArchivedCount = archived.filter((name) => ERA_PATTERN.test(name)).length;

  const allowlistComplete = GITHUB_WORKFLOW_ACTIVE_ALLOWLIST.every((name) => active.includes(name));

  const nonCanonicalActiveCount = active.filter(
    (name) =>
      !(GITHUB_WORKFLOW_ACTIVE_ALLOWLIST as readonly string[]).includes(name) &&
      !shouldArchiveWorkflow(name),
  ).length;

  const benchmark = runArchiveWorkflowsBenchmarkP377({
    activeCount: active.length,
    archivedCount: archived.length,
    eraInActiveCount,
    eraInArchivedCount,
    allowlistComplete,
    nonCanonicalActiveCount,
  });

  const artifactPresent = existsSync(join(root, ARCHIVE_WORKFLOWS_P3_77_ARTIFACT));

  const passed =
    wiringComplete &&
    benchmark.passed &&
    artifactPresent &&
    active.length <= 40 &&
    archived.length >= 80;

  return {
    policyId: ARCHIVE_WORKFLOWS_P3_77_POLICY_ID,
    wiringComplete,
    activeCount: active.length,
    archivedCount: archived.length,
    eraInActiveCount,
    eraInArchivedCount,
    allowlistComplete,
    nonCanonicalActiveCount,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatArchiveWorkflowsP377AuditLines(
  summary: ArchiveWorkflowsP377AuditSummary,
): string[] {
  return [
    `Archive GitHub workflows (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Active workflows: ${summary.activeCount} (max 40)`,
    `Archived workflows: ${summary.archivedCount}`,
    `Era in active: ${summary.eraInActiveCount}`,
    `Era in archive: ${summary.eraInArchivedCount}`,
    `Allowlist complete: ${summary.allowlistComplete ? "yes" : "no"}`,
    `Non-canonical active: ${summary.nonCanonicalActiveCount}`,
    `Benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
