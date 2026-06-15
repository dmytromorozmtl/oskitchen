import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { AI_MARKETING_MANAGER_ERA110_POLICY_ID } from "@/lib/ai/marketing-manager-era110-policy";
import {
  AI_MARKETING_MANAGER_ERA185_CANONICAL_POLICY_ID,
  AI_MARKETING_MANAGER_ERA185_CAPABILITIES,
  AI_MARKETING_MANAGER_ERA185_POLICY_ID,
  AI_MARKETING_MANAGER_ERA185_ROUTE,
  AI_MARKETING_MANAGER_ERA185_SERVICE,
  AI_MARKETING_MANAGER_ERA185_SUMMARY_ARTIFACT,
  AI_MARKETING_MANAGER_ERA185_WIRING_PATHS,
} from "@/lib/ai/marketing-manager-era185-policy";
import {
  auditAiMarketingManagerSmokeEra185Wiring,
  buildAiMarketingManagerSmokeEra185Summary,
  resolveAiMarketingManagerSmokeEra185ProofStatus,
} from "@/lib/ai/marketing-manager-era185-smoke-summary";
import {
  AI_MARKETING_MANAGER_POLICY_ID,
  AI_MARKETING_MANAGER_SERVICE,
} from "@/lib/ai/marketing-manager-policy";

const ROOT = process.cwd();

describe("ai marketing manager era185", () => {
  it("locks era185 policy and artifact path", () => {
    expect(AI_MARKETING_MANAGER_ERA185_POLICY_ID).toBe("era185-ai-marketing-manager-v1");
    expect(AI_MARKETING_MANAGER_ERA185_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-marketing-manager-era185-smoke-summary.json",
    );
    expect(AI_MARKETING_MANAGER_ERA185_ROUTE).toBe("/dashboard/marketing/manager");
    expect(AI_MARKETING_MANAGER_ERA185_WIRING_PATHS).toHaveLength(5);
    expect(AI_MARKETING_MANAGER_ERA185_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era185 with canonical AI Marketing Manager policy", () => {
    expect(AI_MARKETING_MANAGER_ERA185_CANONICAL_POLICY_ID).toBe(
      AI_MARKETING_MANAGER_ERA110_POLICY_ID,
    );
    expect(AI_MARKETING_MANAGER_ERA185_SERVICE).toBe(AI_MARKETING_MANAGER_SERVICE);
    expect(AI_MARKETING_MANAGER_POLICY_ID).toBe("ai-marketing-manager-v1");
  });

  it("audits in-repo AI Marketing Manager Round 2 wiring", () => {
    const audit = auditAiMarketingManagerSmokeEra185Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_MARKETING_MANAGER_ERA185_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes auto campaigns and weather promo wiring", () => {
    const service = readFileSync(join(ROOT, AI_MARKETING_MANAGER_ERA185_SERVICE), "utf8");
    expect(service).toContain("loadMarketingManagerSnapshot");
    expect(service).toContain("listChurnRiskCustomers");

    const builders = readFileSync(join(ROOT, "lib/ai/marketing-manager-builders.ts"), "utf8");
    expect(builders).toContain("buildAutoCampaignRecommendations");
    expect(builders).toContain("buildWeatherPromoRecommendations");
    expect(builders).toContain("buildMarketingManagerDailyBrief");

    const client = readFileSync(
      join(ROOT, "components/marketing/marketing-manager-client.tsx"),
      "utf8",
    );
    expect(client).toContain("ai-marketing-manager-daily-brief");
    expect(client).toContain("Weather & calendar promos");
    expect(client).toContain("autoCampaigns");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAiMarketingManagerSmokeEra185ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiMarketingManagerSmokeEra185ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiMarketingManagerSmokeEra185Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("auto_campaigns");
    expect(summary.capabilities).toContain("weather_promos");
    expect(summary.capabilities).toContain("daily_brief");
  });
});
