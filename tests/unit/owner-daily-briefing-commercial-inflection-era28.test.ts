import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingCommercialInflectionAction,
  mergeBriefingCommercialInflectionTopActions,
} from "@/lib/briefing/owner-daily-briefing-commercial-inflection-era28";
import { buildCommercialInflectionReadinessUiSlice } from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import { resolveCommercialInflectionMilestone } from "@/lib/commercial/commercial-inflection-readiness-era28";

describe("owner-daily-briefing-commercial-inflection-era28", () => {
  it("defers ranked action to p0 vault when milestone is p0_ops_vault_blocked", () => {
    const slice = buildCommercialInflectionReadinessUiSlice();
    expect(buildOwnerDailyBriefingCommercialInflectionAction(slice)).toBeNull();
  });

  it("builds ranked action after vault milestone", () => {
    const summary = {
      policyId: "commercial-inflection-readiness-v1" as const,
      milestone: resolveCommercialInflectionMilestone({
        p0VaultAllPresent: true,
        p0ProofPassed: false,
        tier2ProofPassed: false,
        goDecision: "NO-GO",
        blockedP0Count: 3,
      }),
      pilotExecutableScore: 40,
      governanceScore: 100,
      p0ProofStatus: "awaiting_ops_credentials",
      goDecision: "NO-GO",
      tier2ProofStatus: null,
      integrationRegistryLiveCount: 0,
      channelRegistryLiveCount: 0,
      p0VaultMissingCount: 0,
      blockedP0Count: 3,
      blockedP1Count: 0,
      stopRuleCount: 1,
      blockers: [],
      recommendedCommands: [],
    };
    const slice = buildCommercialInflectionReadinessUiSlice(summary);
    const action = buildOwnerDailyBriefingCommercialInflectionAction(slice);
    expect(action?.id).toBe("commercial-inflection-readiness");
    expect(action?.href).toContain("commercial-inflection-readiness");
  });

  it("merges inflection action ahead of lower-priority actions", () => {
    const summary = {
      policyId: "commercial-inflection-readiness-v1" as const,
      milestone: "tier2_golden_path_blocked" as const,
      pilotExecutableScore: 50,
      governanceScore: 100,
      p0ProofStatus: "proof_passed",
      goDecision: "NO-GO",
      tier2ProofStatus: "awaiting_manual_phases",
      integrationRegistryLiveCount: 0,
      channelRegistryLiveCount: 0,
      p0VaultMissingCount: 0,
      blockedP0Count: 2,
      blockedP1Count: 0,
      stopRuleCount: 0,
      blockers: [],
      recommendedCommands: [],
    };
    const slice = buildCommercialInflectionReadinessUiSlice(summary);
    const inflectionAction = buildOwnerDailyBriefingCommercialInflectionAction(slice)!;
    const merged = mergeBriefingCommercialInflectionTopActions(inflectionAction, [
      {
        id: "other",
        title: "Other",
        reason: "r",
        severity: "normal",
        ownerRole: "owner",
        href: "/x",
        status: "open",
        unblockCondition: "u",
        priority: 5,
        ctaLabel: "Go",
        tone: "normal",
      },
    ]);
    expect(merged[0]?.id).toBe("commercial-inflection-readiness");
  });
});
