import { describe, expect, it } from "vitest";

import { computeGa4ParityScore } from "@/lib/storefront/ga4-parity-score";
import type { ExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";

const baseDecision: ExperimentProdDecision = {
  recommendation: "publish_draft",
  headline: "Draft ahead",
  detail: "Test fixture",
  liftPp: 2.5,
  significant: false,
  sampleSizeOk: true,
  publishedRate: 9.5,
  draftRate: 12,
};

describe("computeGa4ParityScore", () => {
  it("returns not_configured when property id missing", () => {
    const s = computeGa4ParityScore({
      decision: baseDecision,
      ga4: null,
      propertyId: null,
      dataApiConfigured: true,
    });
    expect(s.status).toBe("not_configured");
    expect(s.parityScorePp).toBeNull();
  });

  it("returns ok when lift within 3 pp of GA4", () => {
    const s = computeGa4ParityScore({
      decision: baseDecision,
      ga4: {
        draftCheckoutRatePercent: 12,
        publishedCheckoutRatePercent: 9.5,
        draftCheckoutEvents: 120,
        publishedCheckoutEvents: 95,
      },
      propertyId: "123",
      dataApiConfigured: true,
    });
    expect(s.status).toBe("ok");
    expect(s.parityScorePp).toBe(0);
    expect(s.ga4LiftPp).toBe(2.5);
  });

  it("returns drift when parity delta exceeds 3 pp", () => {
    const s = computeGa4ParityScore({
      decision: { ...baseDecision, liftPp: 8 },
      ga4: {
        draftCheckoutRatePercent: 12,
        publishedCheckoutRatePercent: 9.5,
        draftCheckoutEvents: 120,
        publishedCheckoutEvents: 95,
      },
      propertyId: "123",
      dataApiConfigured: true,
    });
    expect(s.status).toBe("drift");
    expect(s.parityScorePp).toBeGreaterThan(3);
  });
});
