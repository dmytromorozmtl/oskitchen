import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditCompetitorSalesSafeClaims,
  COMPETITOR_SALES_SAFE_CLAIMS_IDS,
  COMPETITOR_SALES_SAFE_CLAIMS_POLICY_ID,
  COMPETITOR_SALES_SAFE_CLAIMS_TOTAL,
  COMPETITOR_SALES_SAFE_CLAIMS_TRACKER_ARTIFACT,
  formatCompetitorSalesSafeClaimsSummary,
  type CompetitorSalesSafeClaimsSection,
} from "@/lib/competitor/competitor-sales-safe-claims-policy";

const ROOT = process.cwd();

describe("Competitor sales-safe claims (Task 29)", () => {
  it("locks absolute-final policy id and eight competitor slots", () => {
    expect(COMPETITOR_SALES_SAFE_CLAIMS_POLICY_ID).toBe(
      "competitor-sales-safe-claims-absolute-final-v1",
    );
    expect(COMPETITOR_SALES_SAFE_CLAIMS_TRACKER_ARTIFACT).toBe(
      "artifacts/competitor-feature-tracker.json",
    );
    expect(COMPETITOR_SALES_SAFE_CLAIMS_TOTAL).toBe(8);
    expect(COMPETITOR_SALES_SAFE_CLAIMS_IDS).toEqual([
      "toast",
      "square",
      "lightspeed",
      "clover",
      "touchbistro",
      "revel",
      "spoton",
      "olo",
    ]);
  });

  it("passes audit on canonical tracker — 8/8 sales-safe competitor claims", () => {
    const tracker = JSON.parse(
      readFileSync(join(ROOT, COMPETITOR_SALES_SAFE_CLAIMS_TRACKER_ARTIFACT), "utf8"),
    ) as {
      salesSafeCompetitorClaims: CompetitorSalesSafeClaimsSection;
      auditReconciliation: {
        absoluteFinalSalesSafeCompetitorClaims: { filled: number; total: number };
      };
    };

    const audit = auditCompetitorSalesSafeClaims(tracker.salesSafeCompetitorClaims);
    expect(audit.missingIds, audit.missingIds.join("; ")).toEqual([]);
    expect(audit.invalidIds, audit.invalidIds.join("; ")).toEqual([]);
    expect(audit.forbiddenPhraseHits, JSON.stringify(audit.forbiddenPhraseHits)).toEqual([]);
    expect(audit.filledCount).toBe(8);
    expect(audit.passed).toBe(true);
    expect(formatCompetitorSalesSafeClaimsSummary(audit)).toBe("8/8 sales-safe competitor claims");
    expect(tracker.auditReconciliation.absoluteFinalSalesSafeCompetitorClaims).toEqual({
      filled: 8,
      total: 8,
      reconciledAt: "2026-06-06T20:35:00.000Z",
      policyId: COMPETITOR_SALES_SAFE_CLAIMS_POLICY_ID,
    });
  });

  it("retains legacy salesSafeFeatures honesty counts unchanged", () => {
    const tracker = JSON.parse(
      readFileSync(join(ROOT, COMPETITOR_SALES_SAFE_CLAIMS_TRACKER_ARTIFACT), "utf8"),
    ) as {
      auditReconciliation: { salesSafeYes: number };
      salesSafeFeatures: Record<string, { salesSafeVerdict: string }>;
    };
    const yesCount = Object.values(tracker.salesSafeFeatures).filter(
      (f) => f.salesSafeVerdict === "yes",
    ).length;
    expect(yesCount).toBe(tracker.auditReconciliation.salesSafeYes);
    expect(yesCount).toBe(1);
  });

  it("wires each claim to sales-safe registry doc", () => {
    const registry = readFileSync(join(ROOT, "docs/sales-safe-claims-registry.md"), "utf8");
    expect(registry).toContain("competitor-feature-tracker.json");
    expect(registry).toContain("salesSafeFeatures");
  });
});
