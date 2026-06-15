import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditWorkflowFreeze,
  formatWorkflowFreezeAuditLines,
} from "@/lib/pm/workflow-freeze-p3-128-audit";
import {
  getCurrentWorkflowFreezeCounts,
  loadWorkflowFreezeRegistry,
  validateWorkflowFreezeRegistry,
} from "@/lib/pm/workflow-freeze-p3-128-operations";
import {
  WORKFLOW_FREEZE_APPROVAL_STEPS,
  WORKFLOW_FREEZE_CI_WORKFLOW,
  WORKFLOW_FREEZE_DOC,
  WORKFLOW_FREEZE_FROZEN_SURFACES,
  WORKFLOW_FREEZE_NPM_SCRIPT,
  WORKFLOW_FREEZE_POLICY_ID,
  WORKFLOW_FREEZE_REGISTRY_ARTIFACT,
  WORKFLOW_FREEZE_UNIT_TEST,
} from "@/lib/pm/workflow-freeze-p3-128-policy";

const ROOT = process.cwd();

describe("Workflow freeze policy (P3-128)", () => {
  it("locks policy id and three frozen surfaces", () => {
    expect(WORKFLOW_FREEZE_POLICY_ID).toBe("workflow-freeze-p3-128-v1");
    expect(WORKFLOW_FREEZE_FROZEN_SURFACES).toEqual([
      "github_workflow",
      "npm_script",
      "script_file",
    ]);
    expect(WORKFLOW_FREEZE_APPROVAL_STEPS).toHaveLength(5);
  });

  it("validates registry counts within baseline plus approved additions", () => {
    const registry = loadWorkflowFreezeRegistry(ROOT);
    const validation = validateWorkflowFreezeRegistry(registry, ROOT);
    expect(validation.policyIdMatches).toBe(true);
    expect(validation.countsWithinBaseline).toBe(true);
    expect(validation.valid).toBe(true);
    expect(registry.approvedAdditions.length).toBeGreaterThanOrEqual(3);
  });

  it("passes full workflow freeze audit", () => {
    const summary = auditWorkflowFreeze(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.relatedPathsReferenced).toBe(true);
    expect(summary.approvalStepsDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("tracks current counts against registry baseline", () => {
    const registry = loadWorkflowFreezeRegistry(ROOT);
    const current = getCurrentWorkflowFreezeCounts(ROOT);
    const validation = validateWorkflowFreezeRegistry(registry, ROOT);

    expect(current.githubWorkflows).toBeLessThanOrEqual(validation.expectedMax.githubWorkflows);
    expect(current.scriptFiles).toBeLessThanOrEqual(validation.expectedMax.scriptFiles);
    expect(current.npmScripts).toBeLessThanOrEqual(validation.expectedMax.npmScripts);
    expect(registry.baselineCounts.githubWorkflows).toBe(121);
    expect(registry.baselineCounts.scriptFiles).toBe(843);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, WORKFLOW_FREEZE_DOC))).toBe(true);
    expect(existsSync(join(ROOT, WORKFLOW_FREEZE_REGISTRY_ARTIFACT))).toBe(true);
    expect(existsSync(join(ROOT, WORKFLOW_FREEZE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[WORKFLOW_FREEZE_NPM_SCRIPT]).toContain(
      "audit-workflow-freeze-p3-128.ts",
    );
    expect(pkg.scripts?.["test:ci:workflow-freeze-p3-128"]).toContain(WORKFLOW_FREEZE_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, WORKFLOW_FREEZE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:workflow-freeze-p3-128");
  });

  it("formats audit lines", () => {
    const summary = auditWorkflowFreeze(ROOT);
    const lines = formatWorkflowFreezeAuditLines(summary);
    expect(lines.some((line) => line.includes(WORKFLOW_FREEZE_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
