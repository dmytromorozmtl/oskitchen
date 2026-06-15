import { describe, expect, it } from "vitest";

import {
  auditFinal19TrustPage,
  auditTrustPageMaturitySurfaces,
  FINAL_19_TRUST_PAGE_POLICY_ID,
} from "@/lib/execution/final-19-trust-page-audit-policy";
import {
  TRUST_PAGE_RUNNER_SCRIPT,
  TRUST_PAGE_SUMMARY_ARTIFACT,
  TRUST_PAGE_VITEST_SPEC,
} from "@/lib/execution/trust-page-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-19 trust page audit", () => {
  it("locks FINAL-19 policy and task slot 213", () => {
    expect(FINAL_19_TRUST_PAGE_POLICY_ID).toBe("final-19-trust-page-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[18]?.id).toBe("FINAL-19");
    expect(FINAL_ORCHESTRATOR_PHASES[18]?.taskSlot).toBe(213);
    expect(TRUST_PAGE_SUMMARY_ARTIFACT).toBe("artifacts/trust-page-summary.json");
    expect(TRUST_PAGE_RUNNER_SCRIPT).toBe("scripts/ops/run-trust-page-audit.ts");
    expect(TRUST_PAGE_VITEST_SPEC).toBe("tests/unit/trust-page-maturity-surfaces.test.ts");
  });

  it("registers trust page BETA / Preview / SKIPPED contract markers", () => {
    expect(auditTrustPageMaturitySurfaces()).toBe(true);
  });

  it("passes trust audit when artifact is honest PASS", () => {
    const report = auditFinal19TrustPage();
    expect(report.surfacesRegistryHonest).toBe(true);
    expect(report.final18Passed).toBe(true);
    expect(report.trustHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});
