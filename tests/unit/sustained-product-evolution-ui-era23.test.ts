import { describe, expect, it } from "vitest";

import { formatSustainedProductEvolutionProgressLabel } from "@/lib/commercial/sustained-product-evolution-ui-era23";
import type { SustainedProductEvolutionUiSlice } from "@/lib/commercial/sustained-product-evolution-ui-era23";

const slice = {
  policyId: "era23-sustained-product-evolution-ui-v1",
  visible: true,
  productEvolutionReady: true,
  goDecision: "GO",
  customerName: "Acme",
  tracks: [],
  healthyCount: 2,
  dueSoonCount: 0,
  overdueCount: 0,
  guidanceCount: 4,
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
  productEvolutionMilestone: "product_evolution_healthy",
  todayHref: "/dashboard/today",
  platformOpsHref: "/platform/commercial-pilot-ops#sustained-product-evolution",
  improvementLoopHref: "/platform/commercial-pilot-ops#continuous-improvement-loop",
  implementationHref: "/dashboard/implementation",
  reportsHref: "/dashboard/reports",
  ghostKitchenLandingHref: "/solutions/ghost-kitchens",
  mealPrepLandingHref: "/solutions/meal-prep",
  goNoGoArtifact: "artifacts/pilot-gono-go-summary.json",
  competitorMatrixArtifact: "artifacts/competitor-feature-gap-matrix-summary.json",
} as SustainedProductEvolutionUiSlice;

describe("sustained-product-evolution-ui-era23 labels", () => {
  it("formats product-led growth label", () => {
    expect(formatSustainedProductEvolutionProgressLabel(slice)).toContain("Product-led growth");
    expect(formatSustainedProductEvolutionProgressLabel({ ...slice, overdueCount: 1 })).toContain(
      "1 overdue",
    );
  });
});
