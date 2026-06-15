import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PRICE_INTELLIGENCE_ERA118_CANONICAL_POLICY_ID,
  PRICE_INTELLIGENCE_ERA118_CAPABILITIES,
  PRICE_INTELLIGENCE_ERA118_POLICY_ID,
  PRICE_INTELLIGENCE_ERA118_ROUTE,
  PRICE_INTELLIGENCE_ERA118_SERVICE,
  PRICE_INTELLIGENCE_ERA118_SUMMARY_ARTIFACT,
  PRICE_INTELLIGENCE_ERA118_WIRING_PATHS,
} from "@/lib/marketplace/price-intelligence-era118-policy";
import {
  auditPriceIntelligenceSmokeWiring,
  buildPriceIntelligenceSmokeEra118Summary,
  resolvePriceIntelligenceSmokeEra118ProofStatus,
} from "@/lib/marketplace/price-intelligence-smoke-summary";
import { PRICE_INTELLIGENCE_POLICY_ID } from "@/lib/marketplace/price-intelligence-policy";

const ROOT = process.cwd();

describe("price intelligence era118", () => {
  it("locks era118 policy and artifact path", () => {
    expect(PRICE_INTELLIGENCE_ERA118_POLICY_ID).toBe("era118-price-intelligence-v1");
    expect(PRICE_INTELLIGENCE_ERA118_SUMMARY_ARTIFACT).toBe(
      "artifacts/price-intelligence-smoke-summary.json",
    );
    expect(PRICE_INTELLIGENCE_ERA118_ROUTE).toBe("/dashboard/marketplace/price-intelligence");
    expect(PRICE_INTELLIGENCE_ERA118_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era118 with canonical price intelligence policy", () => {
    expect(PRICE_INTELLIGENCE_ERA118_CANONICAL_POLICY_ID).toBe(PRICE_INTELLIGENCE_POLICY_ID);
  });

  it("audits in-repo Price Intelligence wiring", () => {
    const audit = auditPriceIntelligenceSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of PRICE_INTELLIGENCE_ERA118_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes cheapest supplier auto-switch spend scan wiring", () => {
    const service = readFileSync(join(ROOT, PRICE_INTELLIGENCE_ERA118_SERVICE), "utf8");
    expect(service).toContain("loadPriceIntelligenceSnapshot");
    expect(service).toContain("findCheapestSupplier");
    expect(service).toContain("resolvePriceIntelligenceSwitchProduct");

    const panel = readFileSync(
      join(ROOT, "components/marketplace/price-intelligence-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("price-intelligence-panel");
    expect(panel).toContain("applyPriceIntelligenceAutoSwitchAction");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePriceIntelligenceSmokeEra118ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePriceIntelligenceSmokeEra118ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPriceIntelligenceSmokeEra118Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("auto_switch");
  });
});
