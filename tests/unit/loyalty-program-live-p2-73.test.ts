import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLoyaltyProgramLiveP273,
  formatLoyaltyProgramLiveP273AuditLines,
} from "@/lib/loyalty/loyalty-program-live-p2-73-audit";
import {
  LOYALTY_PROGRAM_LIVE_P2_73_ARTIFACT,
  LOYALTY_PROGRAM_LIVE_P2_73_CHECK_NPM_SCRIPT,
  LOYALTY_PROGRAM_LIVE_P2_73_CI_NPM_SCRIPT,
  LOYALTY_PROGRAM_LIVE_P2_73_CI_WORKFLOW,
  LOYALTY_PROGRAM_LIVE_P2_73_DOC,
  LOYALTY_PROGRAM_LIVE_P2_73_FULL_CHAIN,
  LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID,
  LOYALTY_PROGRAM_LIVE_P2_73_SCENARIO_COUNT,
  LOYALTY_PROGRAM_LIVE_P2_73_UNIT_TEST,
  LOYALTY_PROGRAM_LIVE_P2_73_WIRING_PATHS,
} from "@/lib/loyalty/loyalty-program-live-p2-73-policy";
import {
  buildDegradedLoyaltyProgramLiveP273Scenarios,
  runLoyaltyProgramLiveBenchmarkP273,
} from "@/lib/loyalty/loyalty-program-live-p2-73-scoring";

const ROOT = process.cwd();

describe("Loyalty program earn/redeem LIVE — full E2E POS + storefront (P2-73)", () => {
  it("locks P2-73 policy, full chain, and scenario count", () => {
    expect(LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID).toBe("loyalty-program-live-p2-73-v1");
    expect(LOYALTY_PROGRAM_LIVE_P2_73_FULL_CHAIN).toEqual([
      "order_earn",
      "crm_balance",
      "redeem_apply",
      "balance_updated",
    ]);
    expect(LOYALTY_PROGRAM_LIVE_P2_73_SCENARIO_COUNT).toBe(6);
  });

  it("passes full loyalty program LIVE flow benchmark", () => {
    const benchmark = runLoyaltyProgramLiveBenchmarkP273();
    expect(benchmark.scenarioCount).toBe(6);
    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("detects degraded loyalty program scenarios", () => {
    const degraded = runLoyaltyProgramLiveBenchmarkP273(
      buildDegradedLoyaltyProgramLiveP273Scenarios(),
    );
    expect(degraded.passed).toBe(false);
    expect(degraded.passPct).toBeLessThan(100);
  });

  it("passes full P2-73 loyalty program LIVE audit", () => {
    const summary = auditLoyaltyProgramLiveP273(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.panelWired).toBe(true);
    expect(summary.customersPageWired).toBe(true);
    expect(summary.posCheckoutWired).toBe(true);
    expect(summary.storefrontCheckoutWired).toBe(true);
    expect(summary.upstreamP262Passed).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-73 wiring paths, CI gate, and artifact", () => {
    for (const path of LOYALTY_PROGRAM_LIVE_P2_73_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LOYALTY_PROGRAM_LIVE_P2_73_CHECK_NPM_SCRIPT]).toContain(
      LOYALTY_PROGRAM_LIVE_P2_73_UNIT_TEST,
    );
    expect(pkg.scripts?.[LOYALTY_PROGRAM_LIVE_P2_73_CI_NPM_SCRIPT]).toContain(
      LOYALTY_PROGRAM_LIVE_P2_73_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, LOYALTY_PROGRAM_LIVE_P2_73_CI_WORKFLOW), "utf8");
    expect(ci).toContain(LOYALTY_PROGRAM_LIVE_P2_73_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, LOYALTY_PROGRAM_LIVE_P2_73_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID);
    expect(artifact.status).toBe("LIVE");
    expect(artifact.scenarioCount).toBe(6);

    const doc = readFileSync(join(ROOT, LOYALTY_PROGRAM_LIVE_P2_73_DOC), "utf8");
    expect(doc).toContain(LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID);
    expect(doc).toContain("order_earn");
  });

  it("formats audit lines", () => {
    const summary = auditLoyaltyProgramLiveP273(ROOT);
    const lines = formatLoyaltyProgramLiveP273AuditLines(summary);
    expect(lines.some((line) => line.includes(LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
