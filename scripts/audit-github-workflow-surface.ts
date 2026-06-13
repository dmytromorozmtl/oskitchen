/**
 * Audit active GitHub workflow surface (<40 target).
 *
 * Usage:
 *   tsx scripts/audit-github-workflow-surface.ts
 *   tsx scripts/audit-github-workflow-surface.ts --write
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  GITHUB_WORKFLOW_ACTIVE_ALLOWLIST,
  GITHUB_WORKFLOW_ACTIVE_DIR,
  GITHUB_WORKFLOW_ACTIVE_MAX,
  GITHUB_WORKFLOW_ARCHIVE_DIR,
  GITHUB_WORKFLOW_ARCHIVE_POLICY_ID,
  GITHUB_WORKFLOW_SURFACE_ARTIFACT,
} from "@/lib/devops/github-workflow-archive-policy";

const ROOT = process.cwd();

function main(): void {
  const write = process.argv.includes("--write");
  const activeDir = join(ROOT, GITHUB_WORKFLOW_ACTIVE_DIR);
  const archiveDir = join(ROOT, GITHUB_WORKFLOW_ARCHIVE_DIR);

  const active = existsSync(activeDir)
    ? readdirSync(activeDir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml")).sort()
    : [];
  const archived = existsSync(archiveDir)
    ? readdirSync(archiveDir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml")).sort()
    : [];

  const allowlistMissing = GITHUB_WORKFLOW_ACTIVE_ALLOWLIST.filter(
    (name) => !active.includes(name),
  );

  const summary = {
    policyId: GITHUB_WORKFLOW_ARCHIVE_POLICY_ID,
    generatedAt: new Date().toISOString(),
    activeCount: active.length,
    archivedCount: archived.length,
    total: active.length + archived.length,
    maxActive: GITHUB_WORKFLOW_ACTIVE_MAX,
    allowlistMissing,
    passed: active.length <= GITHUB_WORKFLOW_ACTIVE_MAX && allowlistMissing.length === 0,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (write) {
    mkdirSync(dirname(join(ROOT, GITHUB_WORKFLOW_SURFACE_ARTIFACT)), { recursive: true });
    writeFileSync(
      join(ROOT, GITHUB_WORKFLOW_SURFACE_ARTIFACT),
      `${JSON.stringify(summary, null, 2)}\n`,
      "utf8",
    );
    console.log(`[audit-github-workflow-surface] artifact → ${GITHUB_WORKFLOW_SURFACE_ARTIFACT}`);
  }

  if (!summary.passed) process.exit(1);
}

main();
