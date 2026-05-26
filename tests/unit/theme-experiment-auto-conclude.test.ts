import { describe, expect, it } from "vitest";

import {
  evaluateAutoConcludeReadiness,
  readAutoConcludeEnabled,
} from "@/lib/storefront/theme-experiment-auto-conclude";
import type { Ga4ParityScore } from "@/lib/storefront/ga4-parity-score";
import type { ExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import type { ExperimentSrmCheck } from "@/lib/storefront/theme-experiment-srm";

const decision: ExperimentProdDecision = {
  recommendation: "publish_draft",
  headline: "Draft wins",
  detail: "ok",
  liftPp: 3,
  revenueLiftPp: 3,
  significant: true,
  sampleSizeOk: true,
  publishedRate: 9,
  draftRate: 12,
  sequentialPassed: true,
  guardrailsOk: true,
  bayesianPassed: true,
};

const parityOk: Ga4ParityScore = {
  status: "ok",
  parityScorePp: 1,
  firstPartyLiftPp: 3,
  ga4LiftPp: 2,
  headline: "ok",
  detail: "ok",
  ga4: null,
  cachedAt: null,
};

const srmOk: ExperimentSrmCheck = {
  warn: false,
  headline: "ok",
  detail: "ok",
  deltaPp: 0,
  observedDraftPercent: 50,
  configuredDraftPercent: 50,
  totalExposures: 1000,
};

describe("auto-conclude readiness", () => {
  it("reads autoConcludeEnabled from json", () => {
    expect(readAutoConcludeEnabled({ autoConcludeEnabled: true })).toBe(true);
    expect(readAutoConcludeEnabled({})).toBe(false);
  });

  it("passes when all gates satisfied", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const r = evaluateAutoConcludeReadiness({
      themeExperimentJson: { autoConcludeScheduledAt: past },
      decision,
      parity: parityOk,
      srm: srmOk,
      edgeSynced: true,
      blockingEdgeJobs: 0,
      experimentEnabled: true,
    });
    expect(r.allPassed).toBe(true);
    expect(r.executeNow).toBe(true);
  });

  it("fails when parity drifts", () => {
    const r = evaluateAutoConcludeReadiness({
      themeExperimentJson: {},
      decision,
      parity: { ...parityOk, status: "drift" as const },
      srm: srmOk,
      edgeSynced: true,
      blockingEdgeJobs: 0,
      experimentEnabled: true,
    });
    expect(r.allPassed).toBe(false);
  });
});
