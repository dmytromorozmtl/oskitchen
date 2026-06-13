/**
 * Archive inactive GitHub workflows outside .github/workflows (121 → ~40).
 *
 * Usage:
 *   tsx scripts/archive-inactive-github-workflows.ts
 *   tsx scripts/archive-inactive-github-workflows.ts --write
 */
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  GITHUB_WORKFLOW_ACTIVE_DIR,
  GITHUB_WORKFLOW_ACTIVE_MAX,
  GITHUB_WORKFLOW_ARCHIVE_DIR,
  GITHUB_WORKFLOW_ARCHIVE_MANIFEST,
  GITHUB_WORKFLOW_ARCHIVE_POLICY_ID,
  shouldArchiveWorkflow,
} from "@/lib/devops/github-workflow-archive-policy";

const ROOT = process.cwd();
const activeDir = join(ROOT, GITHUB_WORKFLOW_ACTIVE_DIR);
const archiveDir = join(ROOT, GITHUB_WORKFLOW_ARCHIVE_DIR);

function main(): void {
  const write = process.argv.includes("--write");
  const files = readdirSync(activeDir)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .sort();

  const toArchive = files.filter(shouldArchiveWorkflow);
  const toKeep = files.filter((name) => !shouldArchiveWorkflow(name));

  const summary = {
    policyId: GITHUB_WORKFLOW_ARCHIVE_POLICY_ID,
    generatedAt: new Date().toISOString(),
    beforeTotal: files.length,
    afterTotal: toKeep.length,
    archivedTotal: toArchive.length,
    maxActive: GITHUB_WORKFLOW_ACTIVE_MAX,
    active: toKeep,
    archived: toArchive,
    passed: toKeep.length <= GITHUB_WORKFLOW_ACTIVE_MAX,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!write) {
    console.log("[archive-inactive-github-workflows] dry-run — pass --write to apply");
    if (!summary.passed) process.exit(1);
    return;
  }

  mkdirSync(archiveDir, { recursive: true });

  for (const filename of toArchive) {
    const from = join(activeDir, filename);
    const to = join(archiveDir, filename);
    renameSync(from, to);
  }

  writeFileSync(
    join(ROOT, GITHUB_WORKFLOW_ARCHIVE_MANIFEST),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );

  console.log(`[archive-inactive-github-workflows] moved ${toArchive.length} → ${GITHUB_WORKFLOW_ARCHIVE_DIR}`);
  console.log(`[archive-inactive-github-workflows] active ${toKeep.length} in ${GITHUB_WORKFLOW_ACTIVE_DIR}`);

  if (!summary.passed) {
    console.error("[archive-inactive-github-workflows] FAIL — active count above max");
    process.exit(1);
  }

  console.log("[archive-inactive-github-workflows] PASS");
}

main();
