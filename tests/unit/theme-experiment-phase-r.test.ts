import { describe, expect, it } from "vitest";

import {
  aggregateFederatedGradients,
  buildFederatedLearningSnapshot,
  evaluateFederatedLearningPublishGate,
} from "@/lib/storefront/theme-experiment-federated-learning";
import {
  detectArmDrift,
  recordEbpfAssignmentSample,
} from "@/lib/storefront/theme-experiment-ebpf-telemetry";
import {
  assignCompositionalVariants,
  buildOrthogonalFactorialSlots,
  factorialCellCount,
  seedCompositionalExperiment,
} from "@/lib/storefront/theme-experiment-compositional-ui";
import { buildHipaaBaaEvidenceBinder, redactPhiFromMetadata } from "@/lib/compliance/hipaa-baa";
import { buildPciSaqAttestation } from "@/lib/compliance/pci-dss-saq";

describe("R1 federated learning", () => {
  it("aggregates with DP and blocks when budget exhausted", () => {
    process.env.THEME_EXPERIMENT_FEDERATED_LEARNING = "1";
    process.env.THEME_EXPERIMENT_FEDERATED_BUDGET = "0.01";
    const cells = [
      {
        workspaceId: "ws1",
        storeSlug: "a",
        featureDim: 5,
        gradientHash: "",
        gradientNorm: 2,
        sampleCount: 100,
      },
    ];
    const snap = buildFederatedLearningSnapshot(cells);
    expect(snap.piiExportBlocked).toBe(true);
    expect(snap.aggregatedTheta.length).toBe(5);
    const { budgetSpent } = aggregateFederatedGradients(cells, 1);
    expect(budgetSpent).toBeGreaterThan(0);
    const gate = evaluateFederatedLearningPublishGate({
      federatedLearning: { ...snap, privacyBudgetRemaining: 0 },
    });
    expect(gate.passed).toBe(false);
  });
});

describe("R2 ebpf telemetry", () => {
  it("detects arm drift", () => {
    const drift = detectArmDrift({ draft: 90, published: 10 });
    expect(drift).toBe(true);
    const snap = recordEbpfAssignmentSample(null, {
      storeSlug: "cafe",
      arm: "draft",
      latencyUs: 120,
      kernelPath: "ebpf",
    });
    expect(snap.samples.length).toBe(1);
  });
});

describe("R5 compositional UI", () => {
  it("assigns orthogonal slot variants", () => {
    const json = seedCompositionalExperiment({
      previousRaw: null,
      headerVariants: ["h1", "h2"],
      heroVariants: ["a", "b"],
      ctaVariants: ["c1", "c2"],
    });
    const snap = (json as { compositionalExperiment: { slots: unknown[]; factorialCells: number } })
      .compositionalExperiment;
    expect(factorialCellCount(snap.slots as Parameters<typeof factorialCellCount>[0])).toBe(8);
    const assigned = assignCompositionalVariants({
      visitorId: "v1",
      snapshot: snap as Parameters<typeof assignCompositionalVariants>[0]["snapshot"],
    });
    expect(assigned.header).toBeTruthy();
    expect(assigned.hero).toBeTruthy();
  });
});

describe("R3 HIPAA", () => {
  it("redacts PHI patterns", () => {
    const out = redactPhiFromMetadata({ email: "a@b.com", note: "SSN 123-45-6789" });
    expect(out?.email).toBe("[REDACTED_PHI]");
    const binder = buildHipaaBaaEvidenceBinder([]);
    expect(binder.controls.length).toBeGreaterThan(0);
  });
});

describe("R4 PCI-DSS", () => {
  it("builds SAQ attestation", () => {
    const att = buildPciSaqAttestation();
    expect(att.saqType).toBe("SAQ-A");
    expect(att.checks.length).toBe(5);
  });
});
