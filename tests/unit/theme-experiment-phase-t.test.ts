import { describe, expect, it } from "vitest";

import {
  aggregateHomomorphicArmCells,
  ckksHomomorphicAdd,
  encryptArmMetricsCell,
  evaluateHomomorphicMetricsPublishGate,
} from "@/lib/storefront/theme-experiment-homomorphic-metrics";
import {
  assignArmQuboKernel,
  buildQuboDiagonal,
  shouldUseQuboBandit,
} from "@/lib/storefront/theme-experiment-qubo-bandit";
import { seedCompositionalExperiment } from "@/lib/storefront/theme-experiment-compositional-ui";
import { runCausalDiscoveryClosedLoop, evaluateCausalDiscoveryAgentGate } from "@/lib/storefront/theme-experiment-causal-discovery-agent";
import { buildCmmcL3MonitoringEvidence } from "@/lib/compliance/cmmc-l3-crosswalk";
import {
  evaluateUkAiSafetyPublishGate,
  mergeUkAiSafetyPack,
  seedUkAiSafetyFromEuPack,
} from "@/lib/compliance/uk-ai-safety";
import { mergeEuAiActPack, buildDefaultAssignmentModelCard } from "@/lib/compliance/eu-ai-act";

describe("T1 homomorphic metrics", () => {
  it("aggregates encrypted cells without decrypt", () => {
    process.env.THEME_EXPERIMENT_HOMOMORPHIC_METRICS = "1";
    const a = encryptArmMetricsCell({ armId: "published", conversions: 10, checkouts: 100 });
    const b = encryptArmMetricsCell({ armId: "draft", conversions: 12, checkouts: 110 });
    const sum = ckksHomomorphicAdd(a.encryptedCheckouts, b.encryptedCheckouts);
    expect(sum.length).toBeGreaterThan(0);
    const snap = aggregateHomomorphicArmCells([a, b], 100);
    expect(snap.arms.length).toBe(2);
    expect(snap.aggregationComplete).toBe(true);
    const gate = evaluateHomomorphicMetricsPublishGate({
      homomorphicMetrics: { ...snap, noiseBudgetRemaining: 0 },
    });
    expect(gate.passed).toBe(false);
  });
});

describe("T2 QUBO bandit", () => {
  it("activates when factorial cells > 8", () => {
    process.env.THEME_EXPERIMENT_QUBO_BANDIT = "1";
    process.env.THEME_EXPERIMENT_QUBO_MIN_CELLS = "8";
    const json = seedCompositionalExperiment({
      previousRaw: null,
      headerVariants: ["a", "b", "c"],
      heroVariants: ["x", "y"],
      ctaVariants: ["1", "2"],
    });
    const comp = (json as { compositionalExperiment: { slots: unknown[] } }).compositionalExperiment;
    expect(shouldUseQuboBandit(comp as Parameters<typeof shouldUseQuboBandit>[0])).toBe(true);
    const snap = {
      at: new Date().toISOString(),
      explorationPercent: 10,
      regretPp: 0,
      featureDim: 5,
      arms: [
        { armId: "published", theta: [1, 0], weight: 50 },
        { armId: "draft", theta: [2, 1], weight: 50 },
      ],
    };
    const costs = buildQuboDiagonal({ snapshot: snap, compositional: comp as Parameters<typeof buildQuboDiagonal>[0]["compositional"] });
    expect(Object.keys(costs).length).toBe(2);
    const result = assignArmQuboKernel({
      storeSlug: "cafe",
      visitorId: "v-qubo",
      segment: "organic",
      snapshot: snap,
      defaultWeights: { published: 50, draft: 50 },
      themeExperimentJson: json,
    });
    expect(result.armId).toBeTruthy();
    expect(result.durationUs).toBeGreaterThanOrEqual(0);
  });
});

describe("T5 causal discovery agent", () => {
  it("runs closed loop and blocks on high spillover approval", () => {
    process.env.THEME_EXPERIMENT_CAUSAL_DISCOVERY_AGENT = "1";
    process.env.THEME_EXPERIMENT_DISCOVERY_APPROVAL_PP = "1";
    const { json, snap } = runCausalDiscoveryClosedLoop(null, [
      {
        workspaceId: "ws1",
        storeSlug: "cafe",
        region: "iad1",
        segment: "organic",
        spilloverPp: 2.5,
        treatmentArmId: "draft",
      },
    ]);
    expect(snap.pendingApproval).toBe(true);
    const gate = evaluateCausalDiscoveryAgentGate(json);
    expect(gate.passed).toBe(false);
  });
});

describe("T3 CMMC L3", () => {
  it("builds practices from FedRAMP crosswalk", () => {
    const ev = buildCmmcL3MonitoringEvidence();
    expect(ev.level).toBe("CMMC_L3");
    expect(ev.practices.length).toBeGreaterThan(0);
  });
});

describe("T4 UK AI Safety", () => {
  it("requires EU pack and passes with seeded evals", () => {
    process.env.THEME_EXPERIMENT_UK_AI_SAFETY = "1";
    process.env.THEME_EXPERIMENT_EU_AI_ACT = "1";
    const eu = mergeEuAiActPack(null, {
      at: new Date().toISOString(),
      modelCard: buildDefaultAssignmentModelCard(),
      oversightLog: [],
      transparencyUrl: null,
    });
    const pack = seedUkAiSafetyFromEuPack(eu);
    const merged = mergeUkAiSafetyPack(eu, pack);
    const gate = evaluateUkAiSafetyPublishGate(merged);
    expect(gate.passed).toBe(true);
  });
});
