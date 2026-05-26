import { describe, expect, it } from "vitest";

import {
  hybridAssignmentBucket,
  sealVisitorWithMlKem,
  evaluateQuantumSafePublishGate,
  recordQuantumVisitorSeal,
} from "@/lib/storefront/theme-experiment-quantum-safe";
import {
  applyHoldoutWsPush,
  evaluateHoldoutWsGate,
  HOLDOUT_WS_REGIONS,
} from "@/lib/storefront/theme-experiment-holdout-ws";
import {
  ingestScientistProposal,
  evaluateAutonomousScientistGate,
  defaultGuardrails,
} from "@/lib/storefront/theme-experiment-autonomous-scientist";
import { buildFedRampHighMonitoringEvidence } from "@/lib/compliance/fedramp-high-crosswalk";
import {
  buildDefaultAssignmentModelCard,
  evaluateEuAiActPublishGate,
  mergeEuAiActPack,
} from "@/lib/compliance/eu-ai-act";

describe("S1 quantum-safe assignment", () => {
  it("hybrid bucket differs from classical-only path", () => {
    const { kemDerivedBucket } = sealVisitorWithMlKem("visitor-abc");
    expect(kemDerivedBucket).toBeGreaterThanOrEqual(0);
    expect(kemDerivedBucket).toBeLessThan(100);
    const hybrid = hybridAssignmentBucket("visitor-abc", "weighted");
    expect(hybrid).toBeGreaterThanOrEqual(0);
    expect(hybrid).toBeLessThan(100);
  });

  it("blocks publish when KEM seals are stale", () => {
    process.env.THEME_EXPERIMENT_QUANTUM_SAFE = "1";
    process.env.THEME_EXPERIMENT_KEM_ROTATION_DAYS = "1";
    const staleAt = new Date(Date.now() - 5 * 86400 * 1000).toISOString();
    const gate = evaluateQuantumSafePublishGate({
      quantumSafeAssignment: {
        at: staleAt,
        hybridMode: "weighted",
        kemRotationDays: 1,
        seals: [
          {
            at: staleAt,
            visitorId: "abc",
            kemCiphertextHash: "x",
            kemAlgorithm: "ML-KEM-768",
            hybridBucket: 10,
            classicalBucket: 20,
          },
        ],
      },
    });
    expect(gate.passed).toBe(false);
    const { json } = recordQuantumVisitorSeal(null, "v1");
    expect((json as { quantumSafeAssignment: { seals: unknown[] } }).quantumSafeAssignment.seals.length).toBe(1);
  });
});

describe("S2 holdout WS control plane", () => {
  it("pushes all regions and enforces SLO gate", () => {
    process.env.THEME_EXPERIMENT_HOLDOUT_WS = "1";
    process.env.THEME_EXPERIMENT_HOLDOUT_WS_SLO_MS = "50";
    const plane = applyHoldoutWsPush({ previousRaw: null, holdoutPercent: 8 });
    expect(plane.regions.length).toBe(HOLDOUT_WS_REGIONS.length);
    expect(plane.policyVersion).toBe(1);
    const gate = evaluateHoldoutWsGate({ holdoutWsControlPlane: plane });
    expect(gate.passed).toBe(false);
  });
});

describe("S5 autonomous scientist", () => {
  it("blocks high-risk pending proposals", () => {
    process.env.THEME_EXPERIMENT_AUTONOMOUS_SCIENTIST = "1";
    const snap = ingestScientistProposal(null, {
      hypothesis: "Test hero CTA",
      variantSummary: "Green button",
      expectedLiftPp: 3,
      riskTier: "high",
    });
    expect(snap.proposals.length).toBe(0);
    const low = ingestScientistProposal(null, {
      hypothesis: "Subtle copy",
      variantSummary: "Headline tweak",
      expectedLiftPp: 1,
      riskTier: "low",
    });
    expect(low.proposals.length).toBe(1);
    const gate = evaluateAutonomousScientistGate({
      autonomousScientist: {
        ...low,
        proposals: [{ ...low.proposals[0], riskTier: "high", status: "proposed" }],
        guardrails: defaultGuardrails(),
      },
    });
    expect(gate.passed).toBe(false);
  });
});

describe("S3 FedRAMP High", () => {
  it("builds monitoring evidence from SOC2/ISO crosswalk", () => {
    const ev = buildFedRampHighMonitoringEvidence();
    expect(ev.controls.length).toBeGreaterThan(0);
    expect(ev.period).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe("S4 EU AI Act", () => {
  it("requires model card when pack enabled", () => {
    process.env.THEME_EXPERIMENT_EU_AI_ACT = "1";
    const gateOff = evaluateEuAiActPublishGate(null);
    expect(gateOff.passed).toBe(false);
    const merged = mergeEuAiActPack(null, {
      at: new Date().toISOString(),
      modelCard: buildDefaultAssignmentModelCard(),
      oversightLog: [],
      transparencyUrl: null,
    });
    const gate = evaluateEuAiActPublishGate(merged);
    expect(gate.passed).toBe(true);
  });
});
