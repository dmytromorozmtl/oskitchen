import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildLaunchWizardCommercialBlockersSlice,
} from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import {
  buildLaunchWizardCommercialSetupSlice,
  mergeLaunchWizardCommercialBlockers,
} from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
import {
  buildLaunchWizardTodayStripViewModel,
  resolveLaunchWizardTodayStripDisplayMode,
} from "@/lib/launch-wizard/launch-wizard-today-strip-era19";
import {
  LAUNCH_WIZARD_TODAY_STRIP_ERA19_BACKLOG_ID,
  LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID,
} from "@/lib/launch-wizard/launch-wizard-today-strip-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

describe("launch-wizard-today-strip-era19 policy", () => {
  it("registers era19 today strip proof", () => {
    expect(LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID).toBe("era19-launch-wizard-today-strip-v1");
    expect(LAUNCH_WIZARD_TODAY_STRIP_ERA19_BACKLOG_ID).toBe("KOS-E19-020");
  });
});

describe("resolveLaunchWizardTodayStripDisplayMode", () => {
  it("uses setup-only mode for owner briefing when commercial blockers exist", () => {
    expect(
      resolveLaunchWizardTodayStripDisplayMode({
        briefingActive: true,
        rolePack: "owner",
        commercialBlockerCount: 2,
      }),
    ).toBe("setup_only");
  });

  it("keeps full mode for owners without briefing", () => {
    expect(
      resolveLaunchWizardTodayStripDisplayMode({
        briefingActive: false,
        rolePack: "owner",
        commercialBlockerCount: 2,
      }),
    ).toBe("full");
  });
});

describe("buildLaunchWizardTodayStripViewModel", () => {
  const progress = { completedCount: 3, totalCount: 8, percent: 38 };

  it("prioritizes commercial unblock in full mode", () => {
    const p0 = buildP0StagingProofUnblockSummary({
      p0ProofStatus: "awaiting_ops_credentials",
      allMissingEnvVars: ["DATABASE_URL"],
      children: {
        ssoIdpStaging: { proofStatus: "proof_skipped_missing_prerequisites" },
        stagingWorkflows: { proofStatus: "proof_skipped_missing_prerequisites" },
        channelLive: { proofStatus: "proof_skipped_missing_prerequisites" },
      },
    });
    const blockers = buildLaunchWizardCommercialBlockersSlice({
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
      ssoProofBlocked: false,
      channelLiveProofBlocked: false,
    });
    const merged = mergeLaunchWizardCommercialBlockers({
      baseBlockers: blockers.blockers,
      goLiveBlockers: [],
    });
    const setup = buildLaunchWizardCommercialSetupSlice({ blockers: merged });
    const view = buildLaunchWizardTodayStripViewModel({
      commercialBlockers: { ...blockers, blockers: merged },
      commercialSetup: setup,
      nextStep: {
        id: "menu-catalog",
        title: "Menu & catalog",
        summary: "Add products",
        href: "/dashboard/menus",
        ctaLabel: "Open menus",
        status: "in_progress",
        ownerRole: "owner",
        missingItems: ["Products"],
        evidenceSource: "menu count",
        order: 2,
      },
      progress,
      displayMode: "full",
    });

    expect(view.mode).toBe("commercial_unblock");
    expect(view.ctaLabel).toBe("Unblock pilot");
    expect(view.headline).toBe(setup.nextUnblock?.label);
  });

  it("shows setup-only strip when owner briefing owns commercial blockers", () => {
    const blockers = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: null,
      p0Blocked: true,
      ssoProofBlocked: false,
      channelLiveProofBlocked: false,
    });
    const setup = buildLaunchWizardCommercialSetupSlice({ blockers: blockers.blockers });
    const view = buildLaunchWizardTodayStripViewModel({
      commercialBlockers: blockers,
      commercialSetup: setup,
      nextStep: {
        id: "storefront",
        title: "Storefront",
        summary: "Publish storefront",
        href: "/dashboard/storefront",
        ctaLabel: "Open storefront",
        status: "in_progress",
        ownerRole: "owner",
        missingItems: ["Published"],
        evidenceSource: "storefront settings",
        order: 3,
      },
      progress,
      displayMode: "setup_only",
    });

    expect(view.displayMode).toBe("setup_only");
    expect(view.mode).toBe("setup_next");
    expect(view.blockerCount).toBe(0);
    expect(view.subline).toContain("briefing above");
  });

  it("links to commercial blockers when setup is complete", () => {
    const blockers = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: null,
      p0Blocked: false,
      ssoProofBlocked: false,
      channelLiveProofBlocked: false,
    });
    const setup = buildLaunchWizardCommercialSetupSlice({ blockers: [] });
    const view = buildLaunchWizardTodayStripViewModel({
      commercialBlockers: blockers,
      commercialSetup: setup,
      nextStep: null,
      progress: { completedCount: 8, totalCount: 8, percent: 100 },
      displayMode: "full",
    });

    expect(view.mode).toBe("setup_complete");
    expect(view.href).toBe(`${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`);
  });
});
