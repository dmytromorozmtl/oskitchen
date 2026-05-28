import { describe, expect, it } from "vitest";

import {
  CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR,
  formatContinuousImprovementLoopProgressLabel,
} from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import type { ContinuousImprovementLoopUiSlice } from "@/lib/commercial/continuous-improvement-loop-ui-era22";

const slice = {
  policyId: "era22-continuous-improvement-loop-ui-v1",
  visible: true,
  pureOperationalMode: true,
  goDecision: "GO",
  customerName: "Acme",
  tracks: [],
  healthyCount: 3,
  dueSoonCount: 0,
  overdueCount: 0,
  guidanceCount: 4,
  nextAttentionTrack: null,
  nextAttentionDetail: null,
  step10Doc: "docs/next-step-10-continuous-improvement-loop-2026-05-28.md",
  releaseChecklistDoc: "docs/continuous-improvement-loop-release-checklist-era22.md",
  featureMaturityDoc: "docs/feature-maturity-matrix.md",
  forbiddenClaimsDoc: "docs/sales-forbidden-claims-training-era20.md",
  competitorLeapfrogDoc: "docs/competitor-leapfrog-roadmap-2026-05-28.md",
  validateCommand: "npm run ops:validate-continuous-improvement-loop",
  syncProgressReportCommand: "npm run ops:sync-continuous-improvement-loop-progress-report -- --write",
  exportReleaseChecklistCommand:
    "npm run ops:export-continuous-improvement-loop-release-checklist -- --write",
  todayHref: "/dashboard/today",
  platformOpsHref: "/platform/commercial-pilot-ops#continuous-improvement-loop",
  integrationHealthHref: "/dashboard/integration-health",
  reportsHref: "/dashboard/reports",
  orderHubHref: "/dashboard/order-hub",
  productionCalendarHref: "/dashboard/production-calendar",
  launchWizardHref: "/dashboard/launch-wizard",
  goNoGoArtifact: "artifacts/pilot-gono-go-summary.json",
  metricsBaselineArtifact: "artifacts/pilot-metrics-baseline-summary.json",
  competitorMatrixArtifact: "artifacts/competitor-feature-gap-matrix-summary.json",
} as ContinuousImprovementLoopUiSlice;

describe("continuous-improvement-loop-ui-era22 labels", () => {
  it("uses platform anchor for ops deep link", () => {
    expect(CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR).toBe("#continuous-improvement-loop");
    expect(slice.platformOpsHref).toContain(CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR);
  });

  it("formats pure operational mode progress label", () => {
    expect(formatContinuousImprovementLoopProgressLabel(slice)).toContain("Pure operational mode");
    expect(formatContinuousImprovementLoopProgressLabel({ ...slice, overdueCount: 2 })).toContain(
      "2 overdue",
    );
  });
});
