import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { AI_PURCHASING_ERA106_POLICY_ID } from "@/lib/ai/ai-purchasing-era106-policy";
import {
  AI_PURCHASING_ERA181_CANONICAL_POLICY_ID,
  AI_PURCHASING_ERA181_CAPABILITIES,
  AI_PURCHASING_ERA181_POLICY_ID,
  AI_PURCHASING_ERA181_ROUTE,
  AI_PURCHASING_ERA181_SERVICE,
  AI_PURCHASING_ERA181_SUMMARY_ARTIFACT,
  AI_PURCHASING_ERA181_WIRING_PATHS,
} from "@/lib/ai/ai-purchasing-era181-policy";
import {
  auditAiPurchasingSmokeEra181Wiring,
  buildAiPurchasingSmokeEra181Summary,
  resolveAiPurchasingSmokeEra181ProofStatus,
} from "@/lib/ai/ai-purchasing-era181-smoke-summary";

const ROOT = process.cwd();

describe("ai purchasing era181", () => {
  it("locks era181 policy and artifact path", () => {
    expect(AI_PURCHASING_ERA181_POLICY_ID).toBe("era181-ai-purchasing-manager-v1");
    expect(AI_PURCHASING_ERA181_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-purchasing-era181-smoke-summary.json",
    );
    expect(AI_PURCHASING_ERA181_ROUTE).toBe("/dashboard/inventory/purchasing-ai");
    expect(AI_PURCHASING_ERA181_WIRING_PATHS).toHaveLength(5);
    expect(AI_PURCHASING_ERA181_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era181 with canonical AI Purchasing Manager policy", () => {
    expect(AI_PURCHASING_ERA181_CANONICAL_POLICY_ID).toBe(AI_PURCHASING_ERA106_POLICY_ID);
    expect(AI_PURCHASING_ERA181_SERVICE).toBe("services/ai/ai-purchasing.ts");
    expect(existsSync(join(ROOT, AI_PURCHASING_ERA181_SERVICE))).toBe(true);
  });

  it("audits in-repo AI Purchasing Manager Round 2 wiring", () => {
    const audit = auditAiPurchasingSmokeEra181Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_PURCHASING_ERA181_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes shortage prediction, price optimization, and daily brief wiring", () => {
    const service = readFileSync(join(ROOT, AI_PURCHASING_ERA181_SERVICE), "utf8");
    expect(service).toContain("generatePurchaseRecommendations");
    expect(service).toContain("generateAiPurchasingDailyBrief");

    const builders = readFileSync(join(ROOT, "lib/ai/ai-purchasing-builders.ts"), "utf8");
    expect(builders).toContain("predictShortage");
    expect(builders).toContain("optimizePrice");
    expect(builders).toContain("alternativeSupplier");

    const dashboard = readFileSync(
      join(ROOT, "components/dashboard/purchasing-ai-dashboard.tsx"),
      "utf8",
    );
    expect(dashboard).toContain("ai-purchasing-daily-brief");
    expect(dashboard).toContain("dailyBrief");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAiPurchasingSmokeEra181ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiPurchasingSmokeEra181ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiPurchasingSmokeEra181Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("shortage_prediction");
    expect(summary.capabilities).toContain("daily_brief");
  });
});
