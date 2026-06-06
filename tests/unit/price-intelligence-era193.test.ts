import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PRICE_INTELLIGENCE_ERA118_POLICY_ID,
} from "@/lib/marketplace/price-intelligence-era118-policy";
import {
  PRICE_INTELLIGENCE_ERA193_CANONICAL_POLICY_ID,
  PRICE_INTELLIGENCE_ERA193_CAPABILITIES,
  PRICE_INTELLIGENCE_ERA193_POLICY_ID,
  PRICE_INTELLIGENCE_ERA193_ROUTE,
  PRICE_INTELLIGENCE_ERA193_SERVICE,
  PRICE_INTELLIGENCE_ERA193_SUMMARY_ARTIFACT,
  PRICE_INTELLIGENCE_ERA193_WIRING_PATHS,
} from "@/lib/marketplace/price-intelligence-era193-policy";
import {
  auditPriceIntelligenceSmokeEra193Wiring,
  buildPriceIntelligenceSmokeEra193Summary,
  resolvePriceIntelligenceSmokeEra193ProofStatus,
} from "@/lib/marketplace/price-intelligence-era193-smoke-summary";
import {
  PRICE_INTELLIGENCE_POLICY_ID,
  PRICE_INTELLIGENCE_SERVICE,
} from "@/lib/marketplace/price-intelligence-policy";

const ROOT = process.cwd();

describe("price intelligence era193", () => {
  it("locks era193 policy and artifact path", () => {
    expect(PRICE_INTELLIGENCE_ERA193_POLICY_ID).toBe("era193-price-intelligence-v1");
    expect(PRICE_INTELLIGENCE_ERA193_SUMMARY_ARTIFACT).toBe(
      "artifacts/price-intelligence-era193-smoke-summary.json",
    );
    expect(PRICE_INTELLIGENCE_ERA193_ROUTE).toBe("/dashboard/marketplace/price-intelligence");
    expect(PRICE_INTELLIGENCE_ERA193_WIRING_PATHS).toHaveLength(6);
    expect(PRICE_INTELLIGENCE_ERA193_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era193 with canonical Price Intelligence policy", () => {
    expect(PRICE_INTELLIGENCE_ERA193_CANONICAL_POLICY_ID).toBe(PRICE_INTELLIGENCE_ERA118_POLICY_ID);
    expect(PRICE_INTELLIGENCE_ERA193_SERVICE).toBe(PRICE_INTELLIGENCE_SERVICE);
    expect(PRICE_INTELLIGENCE_POLICY_ID).toBe("price-intelligence-v1");
  });

  it("audits in-repo Price Intelligence Round 2 wiring", () => {
    const audit = auditPriceIntelligenceSmokeEra193Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of PRICE_INTELLIGENCE_ERA193_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes cheapest supplier auto-switch spend scan wiring", () => {
    const service = readFileSync(join(ROOT, PRICE_INTELLIGENCE_ERA193_SERVICE), "utf8");
    expect(service).toContain("loadPriceIntelligenceSnapshot");
    expect(service).toContain("findCheapestSupplier");
    expect(service).toContain("resolvePriceIntelligenceSwitchProduct");

    const panel = readFileSync(
      join(ROOT, "components/marketplace/price-intelligence-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("price-intelligence-panel");
    expect(panel).toContain("applyPriceIntelligenceAutoSwitchAction");
    expect(panel).toContain("Auto-switch");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePriceIntelligenceSmokeEra193ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePriceIntelligenceSmokeEra193ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPriceIntelligenceSmokeEra193Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("cheapest_supplier");
    expect(summary.capabilities).toContain("auto_switch");
  });
});
