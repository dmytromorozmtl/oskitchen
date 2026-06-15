import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditFifteenMinuteOnboardingP3_142,
  formatFifteenMinuteOnboardingP3_142AuditLines,
} from "@/lib/onboarding/fifteen-minute-onboarding-p3-142-audit";
import {
  loadFifteenMinuteOnboardingRegistry,
  validateFifteenMinuteOnboardingRegistry,
} from "@/lib/onboarding/fifteen-minute-onboarding-p3-142-operations";
import {
  FIFTEEN_MINUTE_ONBOARDING_P3_142_CI_WORKFLOW,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_COMPETITOR,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_DOC,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_HEADLINE,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_NPM_SCRIPT,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_ROUTE,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_TARGET_MINUTES,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_UNIT_TEST,
} from "@/lib/onboarding/fifteen-minute-onboarding-p3-142-policy";

const ROOT = process.cwd();

describe("15-minute onboarding (P3-142)", () => {
  it("locks policy id, Square competitor, and 15-minute target", () => {
    expect(FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID).toBe(
      "fifteen-minute-onboarding-p3-142-v1",
    );
    expect(FIFTEEN_MINUTE_ONBOARDING_P3_142_COMPETITOR).toBe("square");
    expect(FIFTEEN_MINUTE_ONBOARDING_P3_142_TARGET_MINUTES).toBe(15);
    expect(FIFTEEN_MINUTE_ONBOARDING_P3_142_ROUTE).toBe("/dashboard/quick-start");
    expect(FIFTEEN_MINUTE_ONBOARDING_P3_142_HEADLINE).toBe("First order in about 15 minutes");
    expect(FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS).toEqual(["profile", "menu", "order"]);
  });

  it("validates registry with zero completions", () => {
    const registry = loadFifteenMinuteOnboardingRegistry(ROOT);
    const validation = validateFifteenMinuteOnboardingRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroCompleted).toBe(true);
    expect(registry.completedCount).toBe(0);
    expect(registry.steps).toHaveLength(3);
  });

  it("passes full 15-minute onboarding audit", () => {
    const summary = auditFifteenMinuteOnboardingP3_142(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.liveWizardWiringPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.stepsDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, FIFTEEN_MINUTE_ONBOARDING_P3_142_DOC))).toBe(true);
    expect(existsSync(join(ROOT, FIFTEEN_MINUTE_ONBOARDING_P3_142_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[FIFTEEN_MINUTE_ONBOARDING_P3_142_NPM_SCRIPT]).toContain(
      "audit-fifteen-minute-onboarding-p3-142.ts",
    );
    expect(pkg.scripts?.["test:ci:fifteen-minute-onboarding-p3-142"]).toContain(
      FIFTEEN_MINUTE_ONBOARDING_P3_142_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, FIFTEEN_MINUTE_ONBOARDING_P3_142_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:fifteen-minute-onboarding-p3-142");
  });

  it("formats audit lines", () => {
    const summary = auditFifteenMinuteOnboardingP3_142(ROOT);
    const lines = formatFifteenMinuteOnboardingP3_142AuditLines(summary);
    expect(lines.some((line) => line.includes(FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
