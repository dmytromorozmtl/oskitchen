import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditExternalCommsP3_138,
  formatExternalCommsP3_138AuditLines,
} from "@/lib/pm/external-comms-p3-138-audit";
import {
  loadExternalCommsPolicyPmRegistry,
  validateExternalCommsPolicyPmRegistry,
} from "@/lib/pm/external-comms-p3-138-operations";
import {
  EXTERNAL_COMMS_P3_138_APPROVAL_CHAIN,
  EXTERNAL_COMMS_P3_138_APPROVAL_FLOW,
  EXTERNAL_COMMS_P3_138_CHANNEL_IDS,
  EXTERNAL_COMMS_P3_138_CI_WORKFLOW,
  EXTERNAL_COMMS_P3_138_DOC,
  EXTERNAL_COMMS_P3_138_NPM_SCRIPT,
  EXTERNAL_COMMS_P3_138_POLICY_ID,
  EXTERNAL_COMMS_P3_138_PROOF_RULE,
  EXTERNAL_COMMS_P3_138_UNIT_TEST,
} from "@/lib/pm/external-comms-p3-138-policy";

const ROOT = process.cwd();

describe("External comms PM (P3-138)", () => {
  it("locks policy id, proof rule, and approval chain", () => {
    expect(EXTERNAL_COMMS_P3_138_POLICY_ID).toBe("external-comms-p3-138-v1");
    expect(EXTERNAL_COMMS_P3_138_PROOF_RULE).toBe("no claims without proof");
    expect(EXTERNAL_COMMS_P3_138_APPROVAL_FLOW).toBe("PM → Legal → CEO");
    expect(EXTERNAL_COMMS_P3_138_APPROVAL_CHAIN).toEqual(["PM", "Legal", "CEO"]);
    expect(EXTERNAL_COMMS_P3_138_CHANNEL_IDS).toHaveLength(6);
  });

  it("validates registry with zero pending comms", () => {
    const registry = loadExternalCommsPolicyPmRegistry(ROOT);
    const validation = validateExternalCommsPolicyPmRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroPending).toBe(true);
    expect(validation.approvalChainMatches).toBe(true);
    expect(registry.pendingCommsCount).toBe(0);
    expect(registry.channels).toHaveLength(6);
  });

  it("passes full external comms PM audit", () => {
    const summary = auditExternalCommsP3_138(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.liveForbiddenClaimsPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.channelsDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, EXTERNAL_COMMS_P3_138_DOC))).toBe(true);
    expect(existsSync(join(ROOT, EXTERNAL_COMMS_P3_138_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[EXTERNAL_COMMS_P3_138_NPM_SCRIPT]).toContain(
      "audit-external-comms-p3-138.ts",
    );
    expect(pkg.scripts?.["test:ci:external-comms-p3-138"]).toContain(
      EXTERNAL_COMMS_P3_138_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, EXTERNAL_COMMS_P3_138_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:external-comms-p3-138");
  });

  it("formats audit lines", () => {
    const summary = auditExternalCommsP3_138(ROOT);
    const lines = formatExternalCommsP3_138AuditLines(summary);
    expect(lines.some((line) => line.includes(EXTERNAL_COMMS_P3_138_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
