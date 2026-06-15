import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  QUALITY_SCORING_ERA120_POLICY_ID,
} from "@/lib/marketplace/marketplace-quality-scoring-era120-policy";
import {
  QUALITY_SCORING_ERA195_CANONICAL_POLICY_ID,
  QUALITY_SCORING_ERA195_DIMENSIONS,
  QUALITY_SCORING_ERA195_POLICY_ID,
  QUALITY_SCORING_ERA195_ROUTE,
  QUALITY_SCORING_ERA195_SERVICE,
  QUALITY_SCORING_ERA195_SUMMARY_ARTIFACT,
  QUALITY_SCORING_ERA195_TIERS,
  QUALITY_SCORING_ERA195_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-quality-scoring-era195-policy";
import {
  auditQualityScoringSmokeEra195Wiring,
  buildQualityScoringSmokeEra195Summary,
  resolveQualityScoringSmokeEra195ProofStatus,
} from "@/lib/marketplace/marketplace-quality-scoring-era195-smoke-summary";
import {
  QUALITY_SCORING_POLICY_ID,
  QUALITY_SCORING_SERVICE,
} from "@/lib/marketplace/quality-scoring-policy";

const ROOT = process.cwd();

describe("marketplace quality scoring era195", () => {
  it("locks era195 policy and artifact path", () => {
    expect(QUALITY_SCORING_ERA195_POLICY_ID).toBe("era195-marketplace-quality-scoring-v1");
    expect(QUALITY_SCORING_ERA195_SUMMARY_ARTIFACT).toBe(
      "artifacts/marketplace-quality-scoring-era195-smoke-summary.json",
    );
    expect(QUALITY_SCORING_ERA195_ROUTE).toBe("/dashboard/marketplace/quality");
    expect(QUALITY_SCORING_ERA195_WIRING_PATHS).toHaveLength(5);
    expect(QUALITY_SCORING_ERA195_DIMENSIONS).toHaveLength(4);
    expect(QUALITY_SCORING_ERA195_TIERS).toHaveLength(5);
  });

  it("aligns era195 with canonical Marketplace Quality Scoring policy", () => {
    expect(QUALITY_SCORING_ERA195_CANONICAL_POLICY_ID).toBe(QUALITY_SCORING_ERA120_POLICY_ID);
    expect(QUALITY_SCORING_ERA195_SERVICE).toBe(QUALITY_SCORING_SERVICE);
    expect(QUALITY_SCORING_POLICY_ID).toBe("marketplace-quality-scoring-v1");
  });

  it("audits in-repo Marketplace Quality Scoring Round 2 wiring", () => {
    const audit = auditQualityScoringSmokeEra195Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of QUALITY_SCORING_ERA195_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes supplier ratings tier alerts four-dimension wiring", () => {
    const service = readFileSync(join(ROOT, QUALITY_SCORING_ERA195_SERVICE), "utf8");
    expect(service).toContain("loadMarketplaceQualityScoringSnapshot");
    expect(service).toContain("buildSupplierQualityScore");
    expect(service).toContain("computeCompositeQualityScore");

    const builders = readFileSync(
      join(ROOT, "lib/marketplace/quality-scoring-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildQualityAlerts");
    expect(builders).toContain("resolveQualityTier");

    const panel = readFileSync(
      join(ROOT, "components/marketplace/quality-scoring-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("quality-scoring-panel");
    expect(panel).toContain("pendingReviews");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveQualityScoringSmokeEra195ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveQualityScoringSmokeEra195ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildQualityScoringSmokeEra195Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.dimensions).toContain("accuracy");
    expect(summary.dimensions).toContain("packaging");
  });
});
