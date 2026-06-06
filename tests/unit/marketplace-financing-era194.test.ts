import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MARKETPLACE_FINANCING_ERA119_POLICY_ID,
} from "@/lib/marketplace/marketplace-financing-era119-policy";
import {
  MARKETPLACE_FINANCING_ERA194_CANONICAL_POLICY_ID,
  MARKETPLACE_FINANCING_ERA194_POLICY_ID,
  MARKETPLACE_FINANCING_ERA194_PRODUCTS,
  MARKETPLACE_FINANCING_ERA194_ROUTE,
  MARKETPLACE_FINANCING_ERA194_SERVICE,
  MARKETPLACE_FINANCING_ERA194_SUMMARY_ARTIFACT,
  MARKETPLACE_FINANCING_ERA194_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-financing-era194-policy";
import {
  auditMarketplaceFinancingSmokeEra194Wiring,
  buildMarketplaceFinancingSmokeEra194Summary,
  resolveMarketplaceFinancingSmokeEra194ProofStatus,
} from "@/lib/marketplace/marketplace-financing-era194-smoke-summary";
import {
  MARKETPLACE_FINANCING_POLICY_ID,
  MARKETPLACE_FINANCING_SERVICE,
} from "@/lib/marketplace/financing-policy";

const ROOT = process.cwd();

describe("marketplace financing era194", () => {
  it("locks era194 policy and artifact path", () => {
    expect(MARKETPLACE_FINANCING_ERA194_POLICY_ID).toBe("era194-marketplace-financing-v1");
    expect(MARKETPLACE_FINANCING_ERA194_SUMMARY_ARTIFACT).toBe(
      "artifacts/marketplace-financing-era194-smoke-summary.json",
    );
    expect(MARKETPLACE_FINANCING_ERA194_ROUTE).toBe("/dashboard/marketplace/financing");
    expect(MARKETPLACE_FINANCING_ERA194_WIRING_PATHS).toHaveLength(6);
    expect(MARKETPLACE_FINANCING_ERA194_PRODUCTS).toHaveLength(5);
  });

  it("aligns era194 with canonical Marketplace Financing policy", () => {
    expect(MARKETPLACE_FINANCING_ERA194_CANONICAL_POLICY_ID).toBe(
      MARKETPLACE_FINANCING_ERA119_POLICY_ID,
    );
    expect(MARKETPLACE_FINANCING_ERA194_SERVICE).toBe(MARKETPLACE_FINANCING_SERVICE);
    expect(MARKETPLACE_FINANCING_POLICY_ID).toBe("marketplace-financing-v1");
  });

  it("audits in-repo Marketplace Financing Round 2 wiring", () => {
    const audit = auditMarketplaceFinancingSmokeEra194Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MARKETPLACE_FINANCING_ERA194_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes net terms early payment factoring wiring", () => {
    const service = readFileSync(join(ROOT, MARKETPLACE_FINANCING_ERA194_SERVICE), "utf8");
    expect(service).toContain("loadMarketplaceFinancingSnapshot");
    expect(service).toContain("buildFactoringOffers");
    expect(service).toContain("setMarketplaceNetTermsDays");

    const panel = readFileSync(
      join(ROOT, "components/marketplace/marketplace-financing-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("marketplace-financing-panel");
    expect(panel).toContain("Net terms — 30 / 60 / 90");
    expect(panel).toContain("Invoice factoring");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMarketplaceFinancingSmokeEra194ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMarketplaceFinancingSmokeEra194ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMarketplaceFinancingSmokeEra194Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.products).toContain("factoring");
    expect(summary.products).toContain("net_60");
  });
});
