import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AI_PURCHASING_ERA106_CAPABILITIES,
  AI_PURCHASING_ERA106_POLICY_ID,
  AI_PURCHASING_ERA106_ROUTE,
  AI_PURCHASING_ERA106_SERVICE,
  AI_PURCHASING_ERA106_SUMMARY_ARTIFACT,
  AI_PURCHASING_ERA106_WIRING_PATHS,
} from "@/lib/ai/ai-purchasing-era106-policy";
import {
  auditAiPurchasingSmokeWiring,
  buildAiPurchasingSmokeEra106Summary,
  resolveAiPurchasingSmokeEra106ProofStatus,
} from "@/lib/ai/ai-purchasing-smoke-summary";

const ROOT = process.cwd();

describe("ai purchasing era106", () => {
  it("locks era106 policy and artifact path", () => {
    expect(AI_PURCHASING_ERA106_POLICY_ID).toBe("era106-ai-purchasing-manager-v1");
    expect(AI_PURCHASING_ERA106_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-purchasing-smoke-summary.json",
    );
    expect(AI_PURCHASING_ERA106_ROUTE).toBe("/dashboard/inventory/purchasing-ai");
    expect(AI_PURCHASING_ERA106_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era106 service path with canonical AI purchasing service", () => {
    expect(AI_PURCHASING_ERA106_SERVICE).toBe("services/ai/ai-purchasing.ts");
    expect(existsSync(join(ROOT, AI_PURCHASING_ERA106_SERVICE))).toBe(true);
  });

  it("audits in-repo AI Purchasing Manager wiring", () => {
    const audit = auditAiPurchasingSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_PURCHASING_ERA106_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes shortage prediction, price optimization, and daily brief wiring", () => {
    const builders = readFileSync(join(ROOT, "lib/ai/ai-purchasing-builders.ts"), "utf8");
    expect(builders).toContain("predictShortage");
    expect(builders).toContain("optimizePrice");
    expect(builders).toContain("buildAiPurchasingDailyBrief");

    const dashboard = readFileSync(
      join(ROOT, "components/dashboard/purchasing-ai-dashboard.tsx"),
      "utf8",
    );
    expect(dashboard).toContain("ai-purchasing-daily-brief");
    expect(dashboard).toContain("alternativeSupplier");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAiPurchasingSmokeEra106ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiPurchasingSmokeEra106ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiPurchasingSmokeEra106Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("daily_brief");
  });
});
