import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditOnboardingTtvP2_40,
  formatOnboardingTtvP2_40AuditLines,
} from "@/lib/onboarding/onboarding-ttv-p2-40-audit";
import {
  computeOnboardingTtvMinutes,
  evaluateOnboardingTtvStatus,
} from "@/lib/onboarding/onboarding-ttv-p2-40-measurement";
import {
  ONBOARDING_TTV_P2_40_AUDIT_SCRIPT,
  ONBOARDING_TTV_P2_40_CHECK_NPM_SCRIPT,
  ONBOARDING_TTV_P2_40_CI_WORKFLOW,
  ONBOARDING_TTV_P2_40_DOC,
  ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT,
  ONBOARDING_TTV_P2_40_NPM_SCRIPT,
  ONBOARDING_TTV_P2_40_POLICY_ID,
  ONBOARDING_TTV_P2_40_TARGET_MINUTES,
  ONBOARDING_TTV_P2_40_UNIT_TEST,
} from "@/lib/onboarding/onboarding-ttv-p2-40-policy";

const ROOT = process.cwd();

describe("Onboarding TTV measurement (P2-40)", () => {
  it("locks policy id and 30-minute target", () => {
    expect(ONBOARDING_TTV_P2_40_POLICY_ID).toBe("onboarding-ttv-p2-40-v1");
    expect(ONBOARDING_TTV_P2_40_TARGET_MINUTES).toBe(30);
    expect(ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT).toBe("onboarding_ttv_first_order");
  });

  it("computes TTV minutes and status correctly", () => {
    const signupAt = new Date("2026-06-14T10:00:00.000Z");
    const firstOrderAt = new Date("2026-06-14T10:22:00.000Z");
    expect(computeOnboardingTtvMinutes(signupAt, firstOrderAt)).toBe(22);

    const met = evaluateOnboardingTtvStatus({ signupAt, firstOrderAt });
    expect(met.status).toBe("met_target");
    expect(met.metTarget).toBe(true);

    const missed = evaluateOnboardingTtvStatus({
      signupAt,
      firstOrderAt: new Date("2026-06-14T11:00:00.000Z"),
    });
    expect(missed.status).toBe("missed_target");

    const pending = evaluateOnboardingTtvStatus({
      signupAt,
      firstOrderAt: null,
      now: new Date("2026-06-14T10:15:00.000Z"),
    });
    expect(pending.status).toBe("pending_on_track");
    expect(pending.remainingMinutes).toBe(15);
  });

  it("passes full onboarding TTV audit", () => {
    const summary = auditOnboardingTtvP2_40(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.measurementWired).toBe(true);
    expect(summary.recordHookWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.stripWired).toBe(true);
    expect(summary.todayPageWired).toBe(true);
    expect(summary.goldenTtvOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatOnboardingTtvP2_40AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, ONBOARDING_TTV_P2_40_DOC))).toBe(true);
    expect(existsSync(join(ROOT, ONBOARDING_TTV_P2_40_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, ONBOARDING_TTV_P2_40_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[ONBOARDING_TTV_P2_40_NPM_SCRIPT]).toContain("audit-onboarding-ttv-p2-40.ts");
    expect(pkg.scripts?.[ONBOARDING_TTV_P2_40_CHECK_NPM_SCRIPT]).toContain(
      ONBOARDING_TTV_P2_40_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, ONBOARDING_TTV_P2_40_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("onboarding-ttv-p2-40");
  });
});
