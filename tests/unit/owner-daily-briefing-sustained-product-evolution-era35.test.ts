import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingSustainedProductEvolutionAction } from "@/lib/briefing/owner-daily-briefing-sustained-product-evolution-era35";
import { SUSTAINED_PRODUCT_EVOLUTION_BRIEFING_ACTION_PRIORITY } from "@/lib/briefing/owner-daily-briefing-sustained-product-evolution-era35";
import type { SustainedProductEvolutionUiSlice } from "@/lib/commercial/sustained-product-evolution-ui-era23";

const baseSlice = {
  policyId: "era23-sustained-product-evolution-ui-v1",
  visible: true,
  productEvolutionReady: true,
  goDecision: "GO",
  customerName: "Acme",
  tracks: [
    {
      id: "customer_feedback_backlog",
      label: "Product — Customer feedback → implementation backlog",
      frequency: "monthly" as const,
      ownerRole: "product",
      status: "overdue" as const,
      docPath: "docs/implementation-backlog.md",
      routes: ["/dashboard/reports"],
      detail: "capture feedback",
      artifactPath: "artifacts/pilot-metrics-baseline-summary.json",
      lastRunAt: null,
    },
  ],
  healthyCount: 0,
  dueSoonCount: 0,
  overdueCount: 1,
  guidanceCount: 5,
  nextAttentionTrack: null,
  nextAttentionDetail: null,
  step11Doc: "docs/next-step-11-sustained-product-evolution-2026-05-28.md",
  step10Doc: "docs/next-step-10-continuous-improvement-loop-2026-05-28.md",
  ownershipMatrixDoc: "docs/sustained-product-evolution-ownership-matrix-era23.md",
  implementationBacklogDoc: "docs/implementation-backlog.md",
  featureMaturityDoc: "docs/feature-maturity-matrix.md",
  forbiddenClaimsDoc: "docs/sales-forbidden-claims-training-era20.md",
  competitorLeapfrogDoc: "docs/competitor-leapfrog-roadmap-2026-05-28.md",
  releaseChecklistDoc: "docs/continuous-improvement-loop-release-checklist-era22.md",
  validateCommand: "npm run ops:validate-sustained-product-evolution",
  syncProgressReportCommand: "npm run ops:sync-sustained-product-evolution-progress-report -- --write",
  exportOwnershipMatrixCommand:
    "npm run ops:export-sustained-product-evolution-ownership-matrix -- --write",
  postImprovementLoopOrchestratorCommand:
    "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
  validateImprovementLoopCommand: "npm run ops:validate-continuous-improvement-loop -- --json",
  validateImprovementLoopIntegrityCommand:
    "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
  integrityValidateCommand: "npm run ops:validate-sustained-product-evolution-integrity -- --json",
  syncIntegrityBaselineCommand:
    "npm run ops:sync-sustained-product-evolution-integrity-baseline -- --write",
  improvementLoopIntegrityPassed: true,
  productEvolutionIntegrityPassed: true,
  p0ProofStatus: "proof_passed",
  tier2ProofStatus: "proof_passed",
  productEvolutionMilestone: "attention_customer_feedback",
  sustainedOpsConvergenceReady: true,
  pureOperationalModeEra25Active: true,
  pureOperationalModeTerminusHref: "/platform/commercial-pilot-ops#pure-operational-mode-terminus-era25",
  validateTerminusCommand: "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
  todayHref: "/dashboard/today",
  launchWizardHref: "/dashboard/launch-wizard#launch-wizard-product-evolution",
  platformOpsHref: "/platform/commercial-pilot-ops#sustained-product-evolution",
  improvementLoopHref: "/platform/commercial-pilot-ops#continuous-improvement-loop",
  implementationHref: "/dashboard/implementation",
  reportsHref: "/dashboard/reports",
  ghostKitchenLandingHref: "/solutions/ghost-kitchens",
  mealPrepLandingHref: "/solutions/meal-prep",
  goNoGoArtifact: "artifacts/pilot-gono-go-summary.json",
  competitorMatrixArtifact: "artifacts/competitor-feature-gap-matrix-summary.json",
} as SustainedProductEvolutionUiSlice;

describe("owner-daily-briefing-sustained-product-evolution-era35", () => {
  it("builds ranked action with priority 10", () => {
    const action = buildOwnerDailyBriefingSustainedProductEvolutionAction(baseSlice);
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(SUSTAINED_PRODUCT_EVOLUTION_BRIEFING_ACTION_PRIORITY);
    expect(action!.severity).toBe("high");
    expect(action!.href).toBe("/dashboard/reports");
  });
});
