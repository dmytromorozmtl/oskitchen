import { describe, expect, it } from "vitest";

import {
  buildLaunchWizardCommercialInflectionSlice,
  LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ERA28_POLICY_ID,
} from "@/lib/launch-wizard/launch-wizard-commercial-inflection-era28";
import { buildLaunchWizardTodayStripViewModel } from "@/lib/launch-wizard/launch-wizard-today-strip-era19";

describe("launch-wizard-commercial-inflection-era28", () => {
  it("builds slice with integrity validate command", () => {
    const slice = buildLaunchWizardCommercialInflectionSlice();
    expect(slice?.policyId).toBe(LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ERA28_POLICY_ID);
    expect(slice?.integrityValidateCommand).toContain("validate-p0-staging-proof-integrity");
    expect(slice?.platformOpsHref).toContain("commercial-inflection-readiness");
  });

  it("wires inflection into today strip view model", () => {
    const inflection = buildLaunchWizardCommercialInflectionSlice();
    expect(inflection).not.toBeNull();
    if (!inflection) return;

    const view = buildLaunchWizardTodayStripViewModel({
      commercialBlockers: {
        decision: "NO-GO",
        decisionLabel: "NO-GO",
        artifactPresent: false,
        customerExecutionStatus: null,
        blockers: [],
        headline: "Blocked",
      },
      commercialSetup: {
        policyId: "era19-launch-wizard-commercial-setup-v1",
        nextUnblock: null,
        recoveryLinks: [],
      },
      commercialInflection: inflection,
      nextStep: null,
      progress: { completedCount: 1, totalCount: 5, percent: 20 },
    });

    expect(view.commercialInflection?.milestoneLabel).toContain("p0");
    expect(view.subline).toContain("Pilot");
  });
});
