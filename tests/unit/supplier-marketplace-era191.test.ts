import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { SUPPLIER_MARKETPLACE_ERA116_POLICY_ID } from "@/lib/marketplace/supplier-marketplace-era116-policy";
import {
  SUPPLIER_MARKETPLACE_ERA191_CANONICAL_POLICY_ID,
  SUPPLIER_MARKETPLACE_ERA191_LANES,
  SUPPLIER_MARKETPLACE_ERA191_POLICY_ID,
  SUPPLIER_MARKETPLACE_ERA191_ROUTE,
  SUPPLIER_MARKETPLACE_ERA191_SERVICE,
  SUPPLIER_MARKETPLACE_ERA191_SUMMARY_ARTIFACT,
  SUPPLIER_MARKETPLACE_ERA191_WIRING_PATHS,
} from "@/lib/marketplace/supplier-marketplace-era191-policy";
import {
  auditSupplierMarketplaceSmokeEra191Wiring,
  buildSupplierMarketplaceSmokeEra191Summary,
  resolveSupplierMarketplaceSmokeEra191ProofStatus,
} from "@/lib/marketplace/supplier-marketplace-era191-smoke-summary";
import {
  SUPPLIER_MARKETPLACE_POLICY_ID,
  SUPPLIER_MARKETPLACE_SERVICE,
} from "@/lib/marketplace/supplier-marketplace-policy";

const ROOT = process.cwd();

describe("supplier marketplace era191", () => {
  it("locks era191 policy and artifact path", () => {
    expect(SUPPLIER_MARKETPLACE_ERA191_POLICY_ID).toBe("era191-supplier-marketplace-v1");
    expect(SUPPLIER_MARKETPLACE_ERA191_SUMMARY_ARTIFACT).toBe(
      "artifacts/supplier-marketplace-era191-smoke-summary.json",
    );
    expect(SUPPLIER_MARKETPLACE_ERA191_ROUTE).toBe("/dashboard/marketplace");
    expect(SUPPLIER_MARKETPLACE_ERA191_WIRING_PATHS).toHaveLength(6);
    expect(SUPPLIER_MARKETPLACE_ERA191_LANES).toHaveLength(3);
  });

  it("aligns era191 with canonical Supplier Marketplace policy", () => {
    expect(SUPPLIER_MARKETPLACE_ERA191_CANONICAL_POLICY_ID).toBe(
      SUPPLIER_MARKETPLACE_ERA116_POLICY_ID,
    );
    expect(SUPPLIER_MARKETPLACE_ERA191_SERVICE).toBe(SUPPLIER_MARKETPLACE_SERVICE);
    expect(SUPPLIER_MARKETPLACE_POLICY_ID).toBe("supplier-marketplace-v1");
  });

  it("audits in-repo Supplier Marketplace Round 2 wiring", () => {
    const audit = auditSupplierMarketplaceSmokeEra191Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SUPPLIER_MARKETPLACE_ERA191_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes food packaging equipment one-click reorder wiring", () => {
    const service = readFileSync(join(ROOT, SUPPLIER_MARKETPLACE_ERA191_SERVICE), "utf8");
    expect(service).toContain("loadSupplierMarketplaceDashboard");
    expect(service).toContain("loadRecentReorderForLane");
    expect(service).toContain("buildSupplierLaneSnapshot");

    const builders = readFileSync(
      join(ROOT, "lib/marketplace/supplier-marketplace-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildSupplierLaneCatalogHref");
    expect(builders).toContain("buildSupplierMarketplaceDashboard");

    const reorder = readFileSync(
      join(ROOT, "actions/marketplace/supplier-reorder.ts"),
      "utf8",
    );
    expect(reorder).toContain("oneClickReorderMarketplaceItemAction");

    const lanes = readFileSync(
      join(ROOT, "components/marketplace/supplier-marketplace-lanes.tsx"),
      "utf8",
    );
    expect(lanes).toContain("supplier-marketplace-lanes");
    expect(lanes).toContain("SupplierOneClickReorderButton");
    expect(lanes).toContain("Food, packaging, and equipment");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveSupplierMarketplaceSmokeEra191ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveSupplierMarketplaceSmokeEra191ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildSupplierMarketplaceSmokeEra191Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.lanes).toContain("food");
    expect(summary.lanes).toContain("packaging");
    expect(summary.lanes).toContain("equipment");
  });
});
