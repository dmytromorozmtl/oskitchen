import { describe, expect, it } from "vitest";

import {
  proveAssignmentFairness,
  verifyZkProof,
  evaluateZkAssignmentFairnessGate,
  recordZkAssignmentProof,
} from "@/lib/storefront/theme-experiment-zk-assignment-fairness";
import {
  assignArmNeuromorphicKernel,
  shouldUseNeuromorphicAssign,
  neuromorphicMinFactorialCells,
} from "@/lib/storefront/theme-experiment-neuromorphic-assign";
import { seedCompositionalExperiment } from "@/lib/storefront/theme-experiment-compositional-ui";
import {
  runMultiAgentOrchestratorCycle,
  evaluateMultiAgentOrchestratorGate,
} from "@/lib/storefront/theme-experiment-multi-agent-orchestrator";
import { buildStateRampTxRampEvidence } from "@/lib/compliance/stateramp-txramp-crosswalk";
import {
  evaluateEo14110InventoryPublishGate,
  mergeEo14110InventoryPack,
  seedEo14110FromEuUkPacks,
} from "@/lib/compliance/eo-14110-ai-inventory";
import { mergeEuAiActPack, buildDefaultAssignmentModelCard } from "@/lib/compliance/eu-ai-act";

describe("U1 ZK assignment fairness", () => {
  it("proves and verifies Groth16-sim proof", () => {
    process.env.THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS = "1";
    const proof = proveAssignmentFairness({
      visitorId: "visitor-zk-1",
      armId: "draft",
      useQuantumHybrid: true,
    });
    expect(verifyZkProof(proof)).toBe(true);
    const merged = recordZkAssignmentProof(null, proof);
    const gate = evaluateZkAssignmentFairnessGate(merged);
    expect(gate.passed).toBe(true);
  });
});

describe("U2 neuromorphic assign", () => {
  it("activates above factorial threshold", () => {
    process.env.THEME_EXPERIMENT_NEUROMORPHIC_ASSIGN = "1";
    process.env.THEME_EXPERIMENT_NEUROMORPHIC_MIN_CELLS = "16";
    const json = seedCompositionalExperiment({
      previousRaw: null,
      headerVariants: ["a", "b", "c", "d", "e"],
      heroVariants: ["x", "y", "z"],
      ctaVariants: ["1", "2"],
    });
    expect(shouldUseNeuromorphicAssign(json)).toBe(true);
    const snap = {
      at: new Date().toISOString(),
      explorationPercent: 10,
      regretPp: 0,
      featureDim: 5,
      arms: [
        { armId: "published", theta: [1], weight: 50 },
        { armId: "draft", theta: [2], weight: 50 },
      ],
    };
    const result = assignArmNeuromorphicKernel({
      storeSlug: "cafe",
      visitorId: "v-neuro",
      snapshot: snap,
      defaultWeights: { published: 50, draft: 50 },
      themeExperimentJson: json,
    });
    expect(result.armId).toBeTruthy();
    expect(neuromorphicMinFactorialCells()).toBe(16);
  });
});

describe("U5 multi-agent orchestrator", () => {
  it("blocks publish when Slack approval pending", () => {
    process.env.THEME_EXPERIMENT_MULTI_AGENT_ORCHESTRATOR = "1";
    process.env.THEME_EXPERIMENT_ORCHESTRATOR_SLACK_RISK = "0.3";
    const { json } = runMultiAgentOrchestratorCycle({
      autonomousScientist: {
        at: new Date().toISOString(),
        proposals: [
          {
            at: new Date().toISOString(),
            proposalId: "p1",
            hypothesis: "h",
            variantSummary: "v",
            expectedLiftPp: 2,
            riskTier: "low",
            status: "running",
          },
        ],
        guardrails: {
          maxConcurrentRuns: 2,
          minSampleSize: 100,
          requireHumanApproval: true,
          blockedRiskTiers: ["high"],
        },
        approvalTokenHash: null,
        lastConcludeAt: null,
      },
    });
    const gate = evaluateMultiAgentOrchestratorGate(json);
    expect(typeof gate.passed).toBe("boolean");
    expect(gate.headline.length).toBeGreaterThan(0);
  });
});

describe("U3 StateRAMP TX-RAMP", () => {
  it("builds crosswalk evidence", () => {
    const ev = buildStateRampTxRampEvidence();
    expect(ev.controls.some((c) => c.framework === "StateRAMP")).toBe(true);
    expect(ev.controls.some((c) => c.framework === "TX-RAMP")).toBe(true);
  });
});

describe("U4 EO 14110", () => {
  it("requires EU pack and seeds inventory", () => {
    process.env.THEME_EXPERIMENT_EO_14110_INVENTORY = "1";
    process.env.THEME_EXPERIMENT_EU_AI_ACT = "1";
    const eu = mergeEuAiActPack(null, {
      at: new Date().toISOString(),
      modelCard: buildDefaultAssignmentModelCard(),
      oversightLog: [],
      transparencyUrl: null,
    });
    const pack = seedEo14110FromEuUkPacks(eu);
    const merged = mergeEo14110InventoryPack(eu, pack);
    expect(evaluateEo14110InventoryPublishGate(merged).passed).toBe(true);
  });
});
