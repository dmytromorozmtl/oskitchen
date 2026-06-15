import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AI_MARKETING_MANAGER_ERA110_CANONICAL_POLICY_ID,
  AI_MARKETING_MANAGER_ERA110_CAPABILITIES,
  AI_MARKETING_MANAGER_ERA110_POLICY_ID,
  AI_MARKETING_MANAGER_ERA110_ROUTE,
  AI_MARKETING_MANAGER_ERA110_SERVICE,
  AI_MARKETING_MANAGER_ERA110_SUMMARY_ARTIFACT,
  AI_MARKETING_MANAGER_ERA110_WIRING_PATHS,
} from "@/lib/ai/marketing-manager-era110-policy";
import {
  auditAiMarketingManagerSmokeWiring,
  buildAiMarketingManagerSmokeEra110Summary,
  resolveAiMarketingManagerSmokeEra110ProofStatus,
} from "@/lib/ai/marketing-manager-smoke-summary";
import {
  AI_MARKETING_MANAGER_POLICY_ID,
  AI_MARKETING_MANAGER_SERVICE,
} from "@/lib/ai/marketing-manager-policy";

const ROOT = process.cwd();

describe("ai marketing manager era110", () => {
  it("locks era110 policy and artifact path", () => {
    expect(AI_MARKETING_MANAGER_ERA110_POLICY_ID).toBe("era110-ai-marketing-manager-v1");
    expect(AI_MARKETING_MANAGER_ERA110_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-marketing-manager-smoke-summary.json",
    );
    expect(AI_MARKETING_MANAGER_ERA110_ROUTE).toBe("/dashboard/marketing/manager");
    expect(AI_MARKETING_MANAGER_ERA110_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era110 with canonical marketing manager policy", () => {
    expect(AI_MARKETING_MANAGER_ERA110_CANONICAL_POLICY_ID).toBe(AI_MARKETING_MANAGER_POLICY_ID);
    expect(AI_MARKETING_MANAGER_ERA110_SERVICE).toBe(AI_MARKETING_MANAGER_SERVICE);
  });

  it("audits in-repo AI Marketing Manager wiring", () => {
    const audit = auditAiMarketingManagerSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_MARKETING_MANAGER_ERA110_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes auto campaigns and weather promo wiring", () => {
    const service = readFileSync(join(ROOT, AI_MARKETING_MANAGER_ERA110_SERVICE), "utf8");
    expect(service).toContain("loadMarketingManagerSnapshot");
    expect(service).toContain("listChurnRiskCustomers");

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
      resolveAiMarketingManagerSmokeEra110ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiMarketingManagerSmokeEra110ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiMarketingManagerSmokeEra110Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("weather_promos");
  });
});
