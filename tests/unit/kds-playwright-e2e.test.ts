import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditKdsPlaywrightE2E } from "@/lib/qa/kds-playwright-e2e-audit";
import {
  KDS_KITCHEN_PATH,
  KDS_PLAYWRIGHT_AUDIT_SCRIPT,
  KDS_PLAYWRIGHT_CI_WORKFLOW,
  KDS_PLAYWRIGHT_E2E_POLICY_ID,
  KDS_PLAYWRIGHT_E2E_SPEC,
  KDS_PLAYWRIGHT_FLOW_STEPS,
  KDS_PLAYWRIGHT_NPM_SCRIPT,
  KDS_PLAYWRIGHT_UNIT_TEST,
  hasKdsPlaywrightCredentials,
  isKdsPlaywrightE2EEnabled,
  isKdsPlaywrightGateEnabled,
  kdsPlaywrightOrderDetailPath,
  kdsTicketTestId,
} from "@/lib/qa/kds-playwright-e2e-policy";

const ROOT = process.cwd();

describe("KDS Playwright E2E (P1-19)", () => {
  it("locks policy id and six-step kitchen lifecycle", () => {
    expect(KDS_PLAYWRIGHT_E2E_POLICY_ID).toBe("kds-playwright-e2e-v1");
    expect(KDS_KITCHEN_PATH).toBe("/dashboard/kitchen");
    expect(KDS_PLAYWRIGHT_FLOW_STEPS).toHaveLength(6);
    expect(KDS_PLAYWRIGHT_FLOW_STEPS).toEqual([
      "open_shift",
      "pos_order",
      "kds_ticket",
      "bump_ready",
      "expo_lane",
      "complete_order",
    ]);
  });

  it("builds order detail paths and ticket testids", () => {
    expect(kdsPlaywrightOrderDetailPath("abc-123")).toBe("/dashboard/orders/abc-123");
    expect(kdsTicketTestId("abc-123")).toBe("kds-ticket-abc-123");
  });

  it("audits E2E spec, shift flow, bump-expo, and complete wiring", () => {
    const summary = auditKdsPlaywrightE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.shiftFlowWired).toBe(true);
    expect(summary.bumpExpoFlowWired).toBe(true);
    expect(summary.completeStepWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, KDS_PLAYWRIGHT_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, KDS_PLAYWRIGHT_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, KDS_PLAYWRIGHT_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[KDS_PLAYWRIGHT_NPM_SCRIPT]).toContain("audit-kds-playwright-e2e.ts");
    expect(pkg.scripts?.["check:kds-playwright-e2e"]).toContain(KDS_PLAYWRIGHT_UNIT_TEST);
    expect(pkg.scripts?.["test:e2e:kds-playwright"]).toContain(KDS_PLAYWRIGHT_E2E_SPEC);

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:kds-playwright-e2e"]).toContain(KDS_PLAYWRIGHT_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, KDS_PLAYWRIGHT_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("kds-playwright-e2e");
  });

  it("KDS gate requires ENABLE_KDS_V1_CERTIFIED outside production", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalGate = process.env.ENABLE_KDS_V1_CERTIFIED;
    process.env.NODE_ENV = "test";
    delete process.env.ENABLE_KDS_V1_CERTIFIED;
    expect(isKdsPlaywrightGateEnabled()).toBe(false);
    process.env.ENABLE_KDS_V1_CERTIFIED = "true";
    expect(isKdsPlaywrightGateEnabled()).toBe(true);
    if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv;
    else delete process.env.NODE_ENV;
    if (originalGate !== undefined) process.env.ENABLE_KDS_V1_CERTIFIED = originalGate;
    else delete process.env.ENABLE_KDS_V1_CERTIFIED;
  });

  it("E2E gate requires E2E_KDS_PLAYWRIGHT flag", () => {
    const original = process.env.E2E_KDS_PLAYWRIGHT;
    delete process.env.E2E_KDS_PLAYWRIGHT;
    expect(isKdsPlaywrightE2EEnabled()).toBe(false);
    process.env.E2E_KDS_PLAYWRIGHT = "true";
    expect(isKdsPlaywrightE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_KDS_PLAYWRIGHT = original;
    else delete process.env.E2E_KDS_PLAYWRIGHT;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasKdsPlaywrightCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
