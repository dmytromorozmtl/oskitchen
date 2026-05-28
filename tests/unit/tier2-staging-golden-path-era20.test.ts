import { describe, expect, it } from "vitest";

import {
  buildTier2StagingGoldenPathSummary,
  formatTier2StagingGoldenPathReportLines,
} from "@/lib/commercial/tier2-staging-golden-path-summary";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import { buildReportsHubNextActionCards } from "@/lib/reports/reports-hub-next-actions-era21";

describe("tier2-staging-golden-path-summary", () => {
  it("blocks until P0 proof_passed", () => {
    const summary = buildTier2StagingGoldenPathSummary({
      p0ProofStatus: "awaiting_ops_credentials",
      p0GateStep: {
        id: "p0_proof_gate",
        label: "P0",
        kind: "p0_gate",
        status: "SKIPPED",
        reason: "blocked",
      },
      childSteps: [],
    });
    expect(summary.tier2ProofStatus).toBe("awaiting_p0_proof_passed");
    expect(summary.overall).toBe("SKIPPED");
  });

  it("requires manual phases and github evidence for proof_passed", () => {
    const summary = buildTier2StagingGoldenPathSummary({
      p0ProofStatus: "proof_passed",
      p0GateStep: {
        id: "p0_proof_gate",
        label: "P0",
        kind: "p0_gate",
        status: "PASSED",
        reason: "ok",
      },
      childSteps: [
        {
          id: "woo-shopify-live",
          label: "smoke:woo-shopify-live",
          kind: "child_smoke",
          status: "PASSED",
          reason: "exit 0",
        },
      ],
    });
    expect(summary.tier2ProofStatus).toBe("awaiting_manual_phases");
    expect(summary.missingManualEnvVars.length).toBeGreaterThan(0);
    const lines = formatTier2StagingGoldenPathReportLines(summary);
    expect(lines[0]).toContain("SKIPPED");
  });

  it("locks policy id on summary version", () => {
    const summary = buildTier2StagingGoldenPathSummary({
      p0ProofStatus: null,
      p0GateStep: {
        id: "p0_proof_gate",
        label: "P0",
        kind: "p0_gate",
        status: "SKIPPED",
        reason: "missing",
      },
      childSteps: [],
    });
    expect(summary.version).toBe(TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID);
  });
});

describe("reports-hub-next-actions-era21", () => {
  it("caps at three contextual cards", () => {
    const cards = buildReportsHubNextActionCards({
      monthExports: 0,
      pinnedCount: 0,
      visibleReportCount: 10,
      hasFinancialAccess: true,
      hasOperationsAccess: true,
    });
    expect(cards.length).toBeLessThanOrEqual(3);
    expect(cards[0]?.id).toBe("first_export");
  });
});
