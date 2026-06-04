import { describe, expect, it } from "vitest";

import {
  auditMetricCard,
  auditMetricCardModule,
  METRIC_CARD_AUDIT_POLICY_ID,
} from "@/lib/design/metric-card-audit-policy";
import {
  METRIC_CARD_CRITICAL_MODULES,
  METRIC_CARD_PATTERNS_POLICY_ID,
  METRIC_CARD_TEST_ID,
} from "@/lib/design/metric-card-patterns";

describe("metric card audit policy (DES-35)", () => {
  it("locks DES-35 policy id and critical module list", () => {
    expect(METRIC_CARD_PATTERNS_POLICY_ID).toBe("metric-card-patterns-des35-v1");
    expect(METRIC_CARD_AUDIT_POLICY_ID).toBe(METRIC_CARD_PATTERNS_POLICY_ID);
    expect(METRIC_CARD_TEST_ID).toBe("metric-card");
    expect(METRIC_CARD_CRITICAL_MODULES).toContain("app/dashboard/marketplace/page.tsx");
    expect(METRIC_CARD_CRITICAL_MODULES).toContain("components/marketplace/vendor-dashboard-client.tsx");
  });

  it("passes marketplace hub with shared MetricCard import", () => {
    const audit = auditMetricCardModule("app/dashboard/marketplace/page.tsx");
    expect(audit.usesMetricCardPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes vendor dashboard with shared MetricCard import", () => {
    const audit = auditMetricCardModule("components/marketplace/vendor-dashboard-client.tsx");
    expect(audit.usesMetricCardPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical module audit against repo", () => {
    const report = auditMetricCard();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
