import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditArchiveWorkflowsP377,
  formatArchiveWorkflowsP377AuditLines,
} from "@/lib/devops/archive-workflows-p3-77-audit";
import {
  ARCHIVE_WORKFLOWS_P3_77_ARTIFACT,
  ARCHIVE_WORKFLOWS_P3_77_BASELINE_TOTAL,
  ARCHIVE_WORKFLOWS_P3_77_CHECK_NPM_SCRIPT,
  ARCHIVE_WORKFLOWS_P3_77_CI_WORKFLOW,
  ARCHIVE_WORKFLOWS_P3_77_DOC,
  ARCHIVE_WORKFLOWS_P3_77_MAX_ACTIVE,
  ARCHIVE_WORKFLOWS_P3_77_POLICY_ID,
  ARCHIVE_WORKFLOWS_P3_77_UNIT_TEST,
  ARCHIVE_WORKFLOWS_P3_77_WIRING_PATHS,
} from "@/lib/devops/archive-workflows-p3-77-policy";
import { runArchiveWorkflowsBenchmarkP377 } from "@/lib/devops/archive-workflows-p3-77-scoring";
import {
  GITHUB_WORKFLOW_ACTIVE_ALLOWLIST,
  GITHUB_WORKFLOW_ACTIVE_DIR,
  GITHUB_WORKFLOW_ARCHIVE_DIR,
  shouldArchiveWorkflow,
} from "@/lib/devops/github-workflow-archive-policy";

const ROOT = process.cwd();

function listWorkflows(dir: string): string[] {
  const full = join(ROOT, dir);
  return existsSync(full)
    ? readdirSync(full).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    : [];
}

describe("Archive GitHub workflows (P3-77)", () => {
  it("locks P3-77 policy and workflow targets", () => {
    expect(ARCHIVE_WORKFLOWS_P3_77_POLICY_ID).toBe("archive-workflows-p3-77-v1");
    expect(ARCHIVE_WORKFLOWS_P3_77_MAX_ACTIVE).toBe(40);
    expect(ARCHIVE_WORKFLOWS_P3_77_BASELINE_TOTAL).toBe(121);
    expect(GITHUB_WORKFLOW_ACTIVE_ALLOWLIST.length).toBe(34);
  });

  it("passes archive workflows benchmark with live counts", () => {
    const active = listWorkflows(GITHUB_WORKFLOW_ACTIVE_DIR);
    const archived = listWorkflows(GITHUB_WORKFLOW_ARCHIVE_DIR);
    const benchmark = runArchiveWorkflowsBenchmarkP377({
      activeCount: active.length,
      archivedCount: archived.length,
      eraInActiveCount: active.filter((n: string) => /era25|ops-era/i.test(n)).length,
      eraInArchivedCount: archived.filter((n: string) => /era25|ops-era/i.test(n)).length,
      allowlistComplete: GITHUB_WORKFLOW_ACTIVE_ALLOWLIST.every((name) => active.includes(name)),
      nonCanonicalActiveCount: active.filter(
        (name: string) =>
          !(GITHUB_WORKFLOW_ACTIVE_ALLOWLIST as readonly string[]).includes(name) &&
          !shouldArchiveWorkflow(name),
      ).length,
    });
    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("passes full P3-77 archive workflows audit", () => {
    const summary = auditArchiveWorkflowsP377(ROOT);
    expect(summary.activeCount).toBeLessThanOrEqual(ARCHIVE_WORKFLOWS_P3_77_MAX_ACTIVE);
    expect(summary.archivedCount).toBeGreaterThanOrEqual(80);
    expect(summary.eraInActiveCount).toBe(0);
    expect(summary.allowlistComplete).toBe(true);
    expect(summary.nonCanonicalActiveCount).toBe(0);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-77 wiring paths, CI gate, and artifact", () => {
    for (const path of ARCHIVE_WORKFLOWS_P3_77_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[ARCHIVE_WORKFLOWS_P3_77_CHECK_NPM_SCRIPT]).toContain(
      ARCHIVE_WORKFLOWS_P3_77_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, ARCHIVE_WORKFLOWS_P3_77_CI_WORKFLOW), "utf8");
    expect(ci).toContain(ARCHIVE_WORKFLOWS_P3_77_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, ARCHIVE_WORKFLOWS_P3_77_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(ARCHIVE_WORKFLOWS_P3_77_POLICY_ID);
    expect(artifact.activeCount).toBeLessThanOrEqual(40);

    const doc = readFileSync(join(ROOT, ARCHIVE_WORKFLOWS_P3_77_DOC), "utf8");
    expect(doc).toContain(ARCHIVE_WORKFLOWS_P3_77_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditArchiveWorkflowsP377(ROOT);
    const lines = formatArchiveWorkflowsP377AuditLines(summary);
    expect(lines.some((line) => line.includes(ARCHIVE_WORKFLOWS_P3_77_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
