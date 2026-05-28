import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildOwnerDailyBriefingLaunchWizardCommercialAction,
  mergeBriefingLaunchWizardTopActions,
  OWNER_DAILY_BRIEFING_LAUNCH_WIZARD_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-launch-wizard-era19";
import {
  buildLaunchWizardCommercialBlockersSlice,
} from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import {
  buildLaunchWizardCommercialSetupSlice,
  mergeLaunchWizardCommercialBlockers,
} from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";

describe("owner-daily-briefing-launch-wizard-era19 policy", () => {
  it("registers era19 briefing launch wizard proof", () => {
    expect(OWNER_DAILY_BRIEFING_LAUNCH_WIZARD_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-launch-wizard-v1",
    );
  });
});

describe("buildOwnerDailyBriefingLaunchWizardCommercialAction", () => {
  it("builds critical action for next commercial unblock", () => {
    const p0 = buildP0StagingProofUnblockSummary({
      p0ProofStatus: "awaiting_ops_credentials",
      allMissingEnvVars: ["DATABASE_URL"],
      children: {
        ssoIdpStaging: { proofStatus: "proof_skipped_missing_prerequisites" },
        stagingWorkflows: { proofStatus: "proof_skipped_missing_prerequisites" },
        channelLive: { proofStatus: "proof_skipped_missing_prerequisites" },
      },
    });
    const base = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: {
        goNoGo: {
          artifactPresent: true,
          summary: {
            decision: "NO-GO",
            blockers: ["P0 proof blocked"],
            customerExecutionStatus: "skipped_missing_customer",
            evidenceGates: [],
          },
        },
        p0Staging: { summary: p0 },
      } as never,
      p0Blocked: true,
      ssoProofBlocked: true,
      channelLiveProofBlocked: true,
    });
    const merged = mergeLaunchWizardCommercialBlockers({ baseBlockers: base.blockers, goLiveBlockers: [] });
    const setup = buildLaunchWizardCommercialSetupSlice({ blockers: merged });
    const action = buildOwnerDailyBriefingLaunchWizardCommercialAction({
      commercialBlockers: { ...base, blockers: merged },
      nextUnblock: setup.nextUnblock,
    });

    expect(action?.ownerRole).toBe("owner");
    expect(action?.severity).toBe("critical");
    expect(action?.href).toContain("/dashboard/");
    expect(action?.ctaLabel).toBe("Unblock pilot");
  });

  it("returns null when commercial path is clear", () => {
    const base = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: {
        goNoGo: {
          artifactPresent: true,
          summary: {
            decision: "GO",
            blockers: [],
            customerExecutionStatus: "executed",
            evidenceGates: [],
          },
        },
        p0Staging: { summary: null },
      } as never,
      p0Blocked: false,
      ssoProofBlocked: false,
      channelLiveProofBlocked: false,
    });
    const setup = buildLaunchWizardCommercialSetupSlice({ blockers: base.blockers });
    expect(
      buildOwnerDailyBriefingLaunchWizardCommercialAction({
        commercialBlockers: base,
        nextUnblock: setup.nextUnblock,
      }),
    ).toBeNull();
  });
});

describe("mergeBriefingLaunchWizardTopActions", () => {
  it("prioritizes launch wizard commercial action ahead of manager actions", () => {
    const commercial = {
      id: "launch-wizard-p0-staging-blocked",
      title: "P0 staging proof",
      reason: "Ops credentials missing",
      severity: "critical" as const,
      ownerRole: "owner" as const,
      href: "/dashboard/integration-health#integration-recovery-checklist",
      status: "open" as const,
      unblockCondition: "Resolve blocker",
      priority: 2,
      ctaLabel: "Unblock pilot",
      tone: "urgent" as const,
    };
    const general = [
      {
        id: "monitor-order-hub",
        title: "Monitor pipeline",
        reason: "3 active orders",
        severity: "low" as const,
        ownerRole: "manager" as const,
        href: "/dashboard/order-hub",
        status: "monitor" as const,
        unblockCondition: "Clear queue",
        priority: 25,
        ctaLabel: "Open",
        tone: "normal" as const,
      },
    ];

    const merged = mergeBriefingLaunchWizardTopActions(commercial, general);
    expect(merged[0]?.id).toBe("launch-wizard-p0-staging-blocked");
  });
});
