import { describe, expect, it } from "vitest";

import {
  auditStateOfGhostKitchenOpsReportDoc,
  cohortMedian,
  isStateOfGhostKitchenOpsReportPublishable,
  lintStateOfGhostKitchenOpsCopy,
  STATE_OF_GHOST_KITCHEN_OPS_MIN_PILOTS,
  STATE_OF_GHOST_KITCHEN_OPS_REPORT_POLICY_ID,
  STATE_OF_GHOST_KITCHEN_OPS_REPORT_SECTIONS,
} from "@/lib/marketing/state-of-ghost-kitchen-ops-report-policy";

describe("State of Ghost Kitchen Ops report policy (MKT-33)", () => {
  it("locks MKT-33 policy id, 5-pilot gate, and eleven sections", () => {
    expect(STATE_OF_GHOST_KITCHEN_OPS_REPORT_POLICY_ID).toBe(
      "state-of-ghost-kitchen-ops-mkt33-v1",
    );
    expect(STATE_OF_GHOST_KITCHEN_OPS_MIN_PILOTS).toBe(5);
    expect(STATE_OF_GHOST_KITCHEN_OPS_REPORT_SECTIONS).toHaveLength(11);
  });

  it("blocks publish until 5 pilots and publishable flag", () => {
    expect(isStateOfGhostKitchenOpsReportPublishable(4, true)).toBe(false);
    expect(isStateOfGhostKitchenOpsReportPublishable(5, false)).toBe(false);
    expect(isStateOfGhostKitchenOpsReportPublishable(5, true)).toBe(true);
  });

  it("computes cohort median for pilot aggregates", () => {
    expect(cohortMedian([100, 120, 140])).toBe(120);
    expect(cohortMedian([])).toBeNull();
  });

  it("passes audit on canonical industry report doc", () => {
    const audit = auditStateOfGhostKitchenOpsReportDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.sectionCount).toBe(11);
    expect(audit.minPilotsDocumented).toBe(true);
  });

  it("flags forbidden industry report claims", () => {
    const result = lintStateOfGhostKitchenOpsCopy(
      "Thousands of operators surveyed — $50B ghost kitchen market proves we outperform industry with Toast replacement.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest draft outline copy", () => {
    const result = lintStateOfGhostKitchenOpsCopy(
      "Draft outline from 5 anonymized pilot cohort medians — BETA integrations labeled on /trust.",
    );
    expect(result.passed).toBe(true);
  });
});
