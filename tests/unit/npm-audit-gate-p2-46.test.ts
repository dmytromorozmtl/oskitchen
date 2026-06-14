import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNpmAuditGateP246,
  formatNpmAuditGateP246AuditLines,
} from "@/lib/devops/npm-audit-gate-p2-46-audit";
import {
  NPM_AUDIT_GATE_P2_46_ARTIFACT,
  NPM_AUDIT_GATE_P2_46_AUDIT_COMMAND,
  NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT,
  NPM_AUDIT_GATE_P2_46_CHECK_NPM_SCRIPT,
  NPM_AUDIT_GATE_P2_46_CI_NPM_SCRIPT,
  NPM_AUDIT_GATE_P2_46_CI_STEP_NAME,
  NPM_AUDIT_GATE_P2_46_CI_WORKFLOW,
  NPM_AUDIT_GATE_P2_46_DEPLOY_WORKFLOW,
  NPM_AUDIT_GATE_P2_46_DOC,
  NPM_AUDIT_GATE_P2_46_POLICY_ID,
  NPM_AUDIT_GATE_P2_46_WIRING_PATHS,
} from "@/lib/devops/npm-audit-gate-p2-46-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("npm audit CI gate (P2-46)", () => {
  it("locks P2-46 policy and high-severity audit command", () => {
    expect(NPM_AUDIT_GATE_P2_46_POLICY_ID).toBe("npm-audit-gate-p2-46-v1");
    expect(NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT).toBe("audit:dependencies:high");
    expect(NPM_AUDIT_GATE_P2_46_AUDIT_COMMAND).toBe("npm audit --audit-level=high");
    expect(NPM_AUDIT_GATE_P2_46_CI_STEP_NAME).toBe("Dependency audit (high severity gate)");
  });

  it("passes full P2-46 audit — script, CI, deploy gate, artifact", () => {
    const summary = auditNpmAuditGateP246(ROOT);
    expect(summary.auditScriptDefined).toBe(true);
    expect(summary.ciWired).toBe(true);
    expect(summary.deployGateWired).toBe(true);
    expect(summary.ciRunsAfterInstall).toBe(true);
    expect(summary.deployRunsAfterInstall).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("defines high-severity dependency audit script in package.json", () => {
    const pkg = JSON.parse(readSource("package.json")) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.[NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT]).toBe(
      NPM_AUDIT_GATE_P2_46_AUDIT_COMMAND,
    );
  });

  it("wires npm audit gate in CI and deploy-prod-gate after npm ci", () => {
    for (const workflowPath of [NPM_AUDIT_GATE_P2_46_CI_WORKFLOW, NPM_AUDIT_GATE_P2_46_DEPLOY_WORKFLOW]) {
      const workflow = readSource(workflowPath);
      expect(workflow).toContain(NPM_AUDIT_GATE_P2_46_CI_STEP_NAME);
      expect(workflow).toContain(`npm run ${NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT}`);
      const installIndex = workflow.indexOf("npm ci");
      const auditIndex = workflow.indexOf(NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT);
      expect(installIndex).toBeGreaterThanOrEqual(0);
      expect(auditIndex).toBeGreaterThan(installIndex);
    }
  });

  it("P2-46 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of NPM_AUDIT_GATE_P2_46_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${NPM_AUDIT_GATE_P2_46_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${NPM_AUDIT_GATE_P2_46_CI_NPM_SCRIPT}"`);

    const ci = readSource(NPM_AUDIT_GATE_P2_46_CI_WORKFLOW);
    expect(ci).toContain(NPM_AUDIT_GATE_P2_46_CHECK_NPM_SCRIPT);

    const doc = readSource(NPM_AUDIT_GATE_P2_46_DOC);
    expect(doc).toContain(NPM_AUDIT_GATE_P2_46_POLICY_ID);
    expect(doc).toContain(NPM_AUDIT_GATE_P2_46_ARTIFACT);

    const artifact = JSON.parse(readSource(NPM_AUDIT_GATE_P2_46_ARTIFACT));
    expect(artifact.policyId).toBe(NPM_AUDIT_GATE_P2_46_POLICY_ID);
    expect(artifact.auditLevel).toBe("high");
  });

  it("formats audit lines", () => {
    const summary = auditNpmAuditGateP246(ROOT);
    const lines = formatNpmAuditGateP246AuditLines(summary);
    expect(lines.some((line) => line.includes(NPM_AUDIT_GATE_P2_46_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
