import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SUPPLIER_MARKETPLACE_ERA116_CANONICAL_POLICY_ID,
  SUPPLIER_MARKETPLACE_ERA116_LANES,
  SUPPLIER_MARKETPLACE_ERA116_POLICY_ID,
  SUPPLIER_MARKETPLACE_ERA116_ROUTE,
  SUPPLIER_MARKETPLACE_ERA116_SERVICE,
  SUPPLIER_MARKETPLACE_ERA116_SUMMARY_ARTIFACT,
  SUPPLIER_MARKETPLACE_ERA116_WIRING_PATHS,
} from "@/lib/marketplace/supplier-marketplace-era116-policy";
import {
  auditSupplierMarketplaceSmokeWiring,
  buildSupplierMarketplaceSmokeEra116Summary,
  resolveSupplierMarketplaceSmokeEra116ProofStatus,
} from "@/lib/marketplace/supplier-marketplace-smoke-summary";
import { SUPPLIER_MARKETPLACE_POLICY_ID } from "@/lib/marketplace/supplier-marketplace-policy";

const ROOT = process.cwd();

describe("supplier marketplace era116", () => {
  it("locks era116 policy and artifact path", () => {
    expect(SUPPLIER_MARKETPLACE_ERA116_POLICY_ID).toBe("era116-supplier-marketplace-v1");
    expect(SUPPLIER_MARKETPLACE_ERA116_SUMMARY_ARTIFACT).toBe(
      "artifacts/supplier-marketplace-smoke-summary.json",
    );
    expect(SUPPLIER_MARKETPLACE_ERA116_ROUTE).toBe("/dashboard/marketplace");
    expect(SUPPLIER_MARKETPLACE_ERA116_LANES).toHaveLength(3);
  });

  it("aligns era116 with canonical supplier marketplace policy", () => {
    expect(SUPPLIER_MARKETPLACE_ERA116_CANONICAL_POLICY_ID).toBe(SUPPLIER_MARKETPLACE_POLICY_ID);
  });

  it("audits in-repo Supplier Marketplace wiring", () => {
    const audit = auditSupplierMarketplaceSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SUPPLIER_MARKETPLACE_ERA116_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes food packaging equipment one-click reorder wiring", () => {
    const service = readFileSync(join(ROOT, SUPPLIER_MARKETPLACE_ERA116_SERVICE), "utf8");
    expect(service).toContain("loadSupplierMarketplaceDashboard");
    expect(service).toContain("loadRecentReorderForLane");

    const builders = readFileSync(
      join(ROOT, "lib/marketplace/supplier-marketplace-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildSupplierLaneCatalogHref");
    expect(builders).toContain("buildSupplierMarketplaceDashboard");

    const lanes = readFileSync(
      join(ROOT, "components/marketplace/supplier-marketplace-lanes.tsx"),
      "utf8",
    );
    expect(lanes).toContain("supplier-marketplace-lanes");
    expect(lanes).toContain("SupplierOneClickReorderButton");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveSupplierMarketplaceSmokeEra116ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveSupplierMarketplaceSmokeEra116ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildSupplierMarketplaceSmokeEra116Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.lanes).toContain("packaging");
  });
});
