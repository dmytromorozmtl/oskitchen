import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  QUALITY_SCORING_ERA120_CANONICAL_POLICY_ID,
  QUALITY_SCORING_ERA120_DIMENSIONS,
  QUALITY_SCORING_ERA120_POLICY_ID,
  QUALITY_SCORING_ERA120_ROUTE,
  QUALITY_SCORING_ERA120_SERVICE,
  QUALITY_SCORING_ERA120_SUMMARY_ARTIFACT,
  QUALITY_SCORING_ERA120_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-quality-scoring-era120-policy";
import {
  auditQualityScoringSmokeWiring,
  buildQualityScoringSmokeEra120Summary,
  resolveQualityScoringSmokeEra120ProofStatus,
} from "@/lib/marketplace/marketplace-quality-scoring-smoke-summary";
import { QUALITY_SCORING_POLICY_ID } from "@/lib/marketplace/quality-scoring-policy";

const ROOT = process.cwd();

describe("marketplace quality scoring era120", () => {
  it("locks era120 policy and artifact path", () => {
    expect(QUALITY_SCORING_ERA120_POLICY_ID).toBe("era120-marketplace-quality-scoring-v1");
    expect(QUALITY_SCORING_ERA120_SUMMARY_ARTIFACT).toBe(
      "artifacts/marketplace-quality-scoring-smoke-summary.json",
    );
    expect(QUALITY_SCORING_ERA120_ROUTE).toBe("/dashboard/marketplace/quality");
    expect(QUALITY_SCORING_ERA120_DIMENSIONS).toHaveLength(4);
  });

  it("aligns era120 with canonical quality scoring policy", () => {
    expect(QUALITY_SCORING_ERA120_CANONICAL_POLICY_ID).toBe(QUALITY_SCORING_POLICY_ID);
  });

  it("audits in-repo Marketplace Quality Scoring wiring", () => {
    const audit = auditQualityScoringSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of QUALITY_SCORING_ERA120_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes supplier ratings tier alerts four-dimension wiring", () => {
    const service = readFileSync(join(ROOT, QUALITY_SCORING_ERA120_SERVICE), "utf8");
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
    expect(panel).toContain("Packaging");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveQualityScoringSmokeEra120ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveQualityScoringSmokeEra120ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildQualityScoringSmokeEra120Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.dimensions).toContain("delivery");
  });
});
