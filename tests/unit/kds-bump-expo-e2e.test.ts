import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditKdsBumpExpoE2E } from "@/lib/kitchen/kds-bump-expo-e2e-audit";
import {
  KDS_BUMP_EXPO_AUDIT_SCRIPT,
  KDS_BUMP_EXPO_CI_WORKFLOW,
  KDS_BUMP_EXPO_E2E_POLICY_ID,
  KDS_BUMP_EXPO_E2E_SPEC,
  KDS_BUMP_EXPO_FLOW_STEPS,
  KDS_BUMP_EXPO_NPM_SCRIPT,
  KDS_BUMP_EXPO_UNIT_TEST,
  KDS_EXPO_PATH,
  KDS_KITCHEN_PATH,
  hasKdsBumpExpoCredentials,
  isKdsBumpExpoGateEnabled,
  kdsTicketTestId,
} from "@/lib/kitchen/kds-bump-expo-e2e-policy";
import { resolveExpoLane } from "@/lib/kitchen/kds-expo-view";
import { formatKdsTicketNumber } from "@/lib/kitchen/kds-queue-clarity-era18";

const ROOT = process.cwd();

describe("KDS bump → expo E2E (P1-43)", () => {
  it("locks policy id and kitchen flow routes", () => {
    expect(KDS_BUMP_EXPO_E2E_POLICY_ID).toBe("kds-bump-expo-e2e-v1");
    expect(KDS_KITCHEN_PATH).toBe("/dashboard/kitchen");
    expect(KDS_EXPO_PATH).toBe("/dashboard/kitchen/expo");
    expect(kdsTicketTestId("abc")).toBe("kds-ticket-abc");
    expect(KDS_BUMP_EXPO_FLOW_STEPS).toHaveLength(4);
  });

  it("READY status resolves to expo ready lane", () => {
    expect(
      resolveExpoLane({ status: "READY", elapsedSeconds: 60, dueAtIso: null }),
    ).toBe("ready");
    expect(
      resolveExpoLane({ status: "IN_PROGRESS", elapsedSeconds: 60, dueAtIso: null }),
    ).toBe("waiting");
  });

  it("audits E2E spec, flow helper, and expo view wiring", () => {
    const summary = auditKdsBumpExpoE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.expoViewWired).toBe(true);
    expect(summary.kitchenPagePresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, KDS_BUMP_EXPO_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, KDS_BUMP_EXPO_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, KDS_BUMP_EXPO_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[KDS_BUMP_EXPO_NPM_SCRIPT]).toContain("audit-kds-bump-expo-e2e.ts");
    expect(pkg.scripts?.["test:ci:kds-bump-expo-e2e"]).toContain(KDS_BUMP_EXPO_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, KDS_BUMP_EXPO_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:kds-bump-expo-e2e");
  });

  it("formats ticket numbers for expo lane matching", () => {
    const orderId = "12345678-abcd-ef01-2345-6789abcdef01";
    expect(formatKdsTicketNumber(orderId)).toBe("#CDEF01");
  });

  it("KDS gate requires ENABLE_KDS_V1_CERTIFIED outside production", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalGate = process.env.ENABLE_KDS_V1_CERTIFIED;
    process.env.NODE_ENV = "test";
    delete process.env.ENABLE_KDS_V1_CERTIFIED;
    expect(isKdsBumpExpoGateEnabled()).toBe(false);
    process.env.ENABLE_KDS_V1_CERTIFIED = "true";
    expect(isKdsBumpExpoGateEnabled()).toBe(true);
    if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv;
    else delete process.env.NODE_ENV;
    if (originalGate !== undefined) process.env.ENABLE_KDS_V1_CERTIFIED = originalGate;
    else delete process.env.ENABLE_KDS_V1_CERTIFIED;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasKdsBumpExpoCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
