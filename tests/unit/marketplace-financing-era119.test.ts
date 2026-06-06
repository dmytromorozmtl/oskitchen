import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MARKETPLACE_FINANCING_ERA119_CANONICAL_POLICY_ID,
  MARKETPLACE_FINANCING_ERA119_POLICY_ID,
  MARKETPLACE_FINANCING_ERA119_PRODUCTS,
  MARKETPLACE_FINANCING_ERA119_ROUTE,
  MARKETPLACE_FINANCING_ERA119_SERVICE,
  MARKETPLACE_FINANCING_ERA119_SUMMARY_ARTIFACT,
  MARKETPLACE_FINANCING_ERA119_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-financing-era119-policy";
import {
  auditMarketplaceFinancingSmokeWiring,
  buildMarketplaceFinancingSmokeEra119Summary,
  resolveMarketplaceFinancingSmokeEra119ProofStatus,
} from "@/lib/marketplace/marketplace-financing-smoke-summary";
import { MARKETPLACE_FINANCING_POLICY_ID } from "@/lib/marketplace/financing-policy";

const ROOT = process.cwd();

describe("marketplace financing era119", () => {
  it("locks era119 policy and artifact path", () => {
    expect(MARKETPLACE_FINANCING_ERA119_POLICY_ID).toBe("era119-marketplace-financing-v1");
    expect(MARKETPLACE_FINANCING_ERA119_SUMMARY_ARTIFACT).toBe(
      "artifacts/marketplace-financing-smoke-summary.json",
    );
    expect(MARKETPLACE_FINANCING_ERA119_ROUTE).toBe("/dashboard/marketplace/financing");
    expect(MARKETPLACE_FINANCING_ERA119_PRODUCTS).toHaveLength(5);
  });

  it("aligns era119 with canonical marketplace financing policy", () => {
    expect(MARKETPLACE_FINANCING_ERA119_CANONICAL_POLICY_ID).toBe(MARKETPLACE_FINANCING_POLICY_ID);
  });

  it("audits in-repo Marketplace Financing wiring", () => {
    const audit = auditMarketplaceFinancingSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MARKETPLACE_FINANCING_ERA119_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes net terms early payment factoring wiring", () => {
    const service = readFileSync(join(ROOT, MARKETPLACE_FINANCING_ERA119_SERVICE), "utf8");
    expect(service).toContain("loadMarketplaceFinancingSnapshot");
    expect(service).toContain("buildFactoringOffers");
    expect(service).toContain("setMarketplaceNetTermsDays");

    const panel = readFileSync(
      join(ROOT, "components/marketplace/marketplace-financing-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("marketplace-financing-panel");
    expect(panel).toContain("Invoice factoring");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMarketplaceFinancingSmokeEra119ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMarketplaceFinancingSmokeEra119ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMarketplaceFinancingSmokeEra119Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.products).toContain("early_payment");
  });
});
