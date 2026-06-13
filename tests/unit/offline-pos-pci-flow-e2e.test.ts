import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditOfflinePosPciFlowE2E } from "@/lib/qa/offline-pos-pci-flow-e2e-audit";
import {
  OFFLINE_POS_PCI_FLOW_E2E_AUDIT_SCRIPT,
  OFFLINE_POS_PCI_FLOW_E2E_CI_WORKFLOW,
  OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS,
  OFFLINE_POS_PCI_FLOW_E2E_NPM_SCRIPT,
  OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID,
  OFFLINE_POS_PCI_FLOW_E2E_SPEC,
  OFFLINE_POS_PCI_FLOW_E2E_UNIT_TEST,
  POS_TERMINAL_PATH,
  hasOfflinePosPciFlowE2ECredentials,
  isNoopV1EmptyOnly,
  isOfflinePosPciFlowE2EEnabled,
} from "@/lib/qa/offline-pos-pci-flow-e2e-policy";
import { runOfflinePosPciNoopV1ContractChecks } from "@/lib/qa/offline-pos-pci-flow-e2e-scoring";

const ROOT = process.cwd();

describe("Offline POS PCI flow E2E (P1-21)", () => {
  it("locks policy id and five-step offline pci flow", () => {
    expect(OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID).toBe("offline-pos-pci-flow-e2e-p1-21-v1");
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS).toHaveLength(5);
    expect(OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS).toContain("verify_noop_v1_pci");
    expect(isNoopV1EmptyOnly("noop-v1", "", "")).toBe(true);
    expect(isNoopV1EmptyOnly("aes-gcm-v1", "cipher", "4242")).toBe(true);
  });

  it("passes noop-v1 PCI contract — empty only, no insecure fallback", async () => {
    const result = await runOfflinePosPciNoopV1ContractChecks(ROOT);
    expect(result.passed).toBe(true);
    expect(result.checks.find((row) => row.id === "static-no-insecure-btoa-fallback")?.passed).toBe(
      true,
    );
    expect(result.checks.find((row) => row.id === "noop-v1-empty-only")?.passed).toBe(true);
  });

  it("audits E2E spec, reconnect sync, and noop-v1 scoring wiring", () => {
    const summary = auditOfflinePosPciFlowE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.reconnectSyncWired).toBe(true);
    expect(summary.noopV1ScoringWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, OFFLINE_POS_PCI_FLOW_E2E_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, OFFLINE_POS_PCI_FLOW_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, OFFLINE_POS_PCI_FLOW_E2E_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[OFFLINE_POS_PCI_FLOW_E2E_NPM_SCRIPT]).toContain(
      "audit-offline-pos-pci-flow-e2e.ts",
    );
    expect(pkg.scripts?.["check:offline-pos-pci-flow-e2e"]).toContain(
      OFFLINE_POS_PCI_FLOW_E2E_UNIT_TEST,
    );
    expect(pkg.scripts?.["test:e2e:offline-pos-pci-flow"]).toContain(
      OFFLINE_POS_PCI_FLOW_E2E_SPEC,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:offline-pos-pci-flow-e2e"]).toContain(
      OFFLINE_POS_PCI_FLOW_E2E_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, OFFLINE_POS_PCI_FLOW_E2E_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("offline-pos-pci-flow-e2e");
  });

  it("E2E gate requires E2E_OFFLINE_POS_PCI_FLOW flag", () => {
    const original = process.env.E2E_OFFLINE_POS_PCI_FLOW;
    delete process.env.E2E_OFFLINE_POS_PCI_FLOW;
    expect(isOfflinePosPciFlowE2EEnabled()).toBe(false);
    process.env.E2E_OFFLINE_POS_PCI_FLOW = "true";
    expect(isOfflinePosPciFlowE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_OFFLINE_POS_PCI_FLOW = original;
    else delete process.env.E2E_OFFLINE_POS_PCI_FLOW;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasOfflinePosPciFlowE2ECredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
