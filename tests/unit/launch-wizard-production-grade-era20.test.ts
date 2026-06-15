import { describe, expect, it } from "vitest";

import {
  auditLaunchWizardStepDefinitionHrefs,
  buildLaunchWizardP0ProofChip,
  buildLaunchWizardProductionGradeSnapshot,
  finalizeLaunchWizardStepForProductionGrade,
  isOperationalDashboardHref,
} from "@/lib/launch-wizard/launch-wizard-production-grade-era20";
import { LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-production-grade-era20-policy";
import {
  buildLaunchWizardSteps,
  type LaunchWizardSignals,
} from "@/lib/launch-wizard/launch-wizard-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

const blockedPilotSignals: LaunchWizardSignals = {
  businessProfile: {
    businessName: "Cafe",
    businessType: "cafe",
    settingsCompleted: true,
  },
  menuCatalog: {
    menuCount: 1,
    productCount: 1,
    firstMenuCreated: true,
    firstProductCreated: true,
  },
  storefront: { publishedCount: 1 },
  pos: { firstUse: true },
  production: { firstProductionCompleted: true, productionPlanCount: 1 },
  integrations: {
    connectedCount: 1,
    errorCount: 0,
    pilotChannelsReady: true,
    liveProofIncompleteCount: 0,
  },
  goLive: {
    projectId: "proj-1",
    criticalBlockerCount: 0,
    simulationPassed: true,
    approvalsPending: 0,
  },
  pilotReadiness: {
    workspaceAttentionCount: 0,
    hasUrgent: false,
    commercialDecision: "NO-GO",
    p0Blocked: true,
    customerExecutionStatus: "skipped_missing_customer",
    ssoProofBlocked: true,
    channelLiveProofBlocked: true,
  },
};

describe("launch-wizard-production-grade-era20", () => {
  it("locks era20 production-grade policy id", () => {
    expect(LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID).toBe(
      "era20-launch-wizard-production-grade-v1",
    );
  });

  it("audits all step definition workflow hrefs as dashboard paths", () => {
    const audit = auditLaunchWizardStepDefinitionHrefs();
    expect(audit.valid).toBe(true);
    expect(audit.invalidStepIds).toEqual([]);
  });

  it("routes blocked pilot readiness to commercial blockers anchor", () => {
    const [pilotStep] = buildLaunchWizardSteps(blockedPilotSignals).filter(
      (row) => row.id === "pilot-readiness",
    );
    const finalized = finalizeLaunchWizardStepForProductionGrade(pilotStep);
    expect(finalized.href).toBe(`${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`);
    expect(finalized.ctaLabel).toBe("Review commercial blockers");
    expect(finalized.setupGuidance).toContain("GO/NO-GO");
  });

  it("builds P0 proof chip when awaiting ops credentials", () => {
    const chip = buildLaunchWizardP0ProofChip({
      version: "era17-p0-staging-proof-unblock-v1",
      runAt: new Date().toISOString(),
      commitSha: null,
      overall: "SKIPPED",
      p0ProofStatus: "awaiting_ops_credentials",
      defaultProofStatus: "awaiting_ops_credentials",
      allMissingEnvVars: ["DATABASE_URL", "E2E_STAGING_BASE_URL"],
      children: {
        ssoIdpStaging: {
          smokeScript: "a",
          artifactPath: "b",
          overall: null,
          proofStatus: null,
          missingEnvVars: [],
        },
        stagingWorkflowsFirstGreen: {
          smokeScript: "a",
          artifactPath: "b",
          overall: null,
          proofStatus: null,
          missingEnvVars: [],
        },
        channelLive: {
          smokeScript: "a",
          artifactPath: "b",
          overall: null,
          proofStatus: null,
          missingEnvVars: [],
        },
      },
    });
    expect(chip?.missingEnvVarCount).toBe(2);
    expect(chip?.label).toContain("2 env vars");
  });

  it("snapshot counts operational CTAs for all steps", () => {
    const steps = buildLaunchWizardSteps(blockedPilotSignals);
    const snapshot = buildLaunchWizardProductionGradeSnapshot({
      steps,
      commercialBlockerCount: 3,
      p0: null,
    });
    expect(snapshot.operationalCtaCount).toBe(steps.length);
    expect(snapshot.commercialBlockerCount).toBe(3);
    expect(isOperationalDashboardHref("/dashboard/go-live/projects/x")).toBe(true);
  });
});
