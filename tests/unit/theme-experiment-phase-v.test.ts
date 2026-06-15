import { describe, expect, it } from "vitest";

import {
  attestAndAssignInEnclave,
  verifyTeeAttestationQuote,
  evaluateTeeAttestationPublishGate,
  recordTeeAttestationQuote,
} from "@/lib/storefront/theme-experiment-tee-assign";
import {
  assignArmPhotonicKernel,
  shouldUsePhotonicAssign,
  photonicMinFactorialCells,
} from "@/lib/storefront/theme-experiment-photonic-assign";
import { seedCompositionalExperiment } from "@/lib/storefront/theme-experiment-compositional-ui";
import {
  ingestGlobalMeshOutcomes,
  evaluateGlobalMeshPublishGate,
} from "@/lib/storefront/theme-experiment-global-mesh";
import { buildIrapEssentialEightEvidence } from "@/lib/compliance/irap-essential-eight";
import {
  evaluateNistAiRmfPublishGate,
  mergeNistAiRmfPack,
  seedNistAiRmfFromCompliancePacks,
} from "@/lib/compliance/nist-ai-rmf";
import { mergeEo14110InventoryPack, seedEo14110FromEuUkPacks } from "@/lib/compliance/eo-14110-ai-inventory";
import { mergeEuAiActPack, buildDefaultAssignmentModelCard } from "@/lib/compliance/eu-ai-act";

describe("V1 TEE assignment", () => {
  it("attests enclave quote", () => {
    process.env.THEME_EXPERIMENT_TEE_ASSIGN = "1";
    const quote = attestAndAssignInEnclave({ visitorId: "v-tee", armId: "draft" });
    expect(verifyTeeAttestationQuote(quote)).toBe(true);
    const merged = recordTeeAttestationQuote(null, quote);
    expect(evaluateTeeAttestationPublishGate(merged).passed).toBe(true);
  });
});

describe("V2 photonic assign", () => {
  it("activates above 32 factorial cells", () => {
    process.env.THEME_EXPERIMENT_PHOTONIC_ASSIGN = "1";
    process.env.THEME_EXPERIMENT_PHOTONIC_MIN_CELLS = "32";
    const json = seedCompositionalExperiment({
      previousRaw: null,
      headerVariants: ["a", "b", "c", "d", "e", "f"],
      heroVariants: ["x", "y", "z", "w"],
      ctaVariants: ["1", "2", "3"],
    });
    expect(shouldUsePhotonicAssign(json)).toBe(true);
    expect(photonicMinFactorialCells()).toBe(32);
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
    const r = assignArmPhotonicKernel({
      storeSlug: "cafe",
      visitorId: "v-pho",
      snapshot: snap,
      defaultWeights: { published: 50, draft: 50 },
      themeExperimentJson: json,
    });
    expect(r.armId).toBeTruthy();
  });
});

describe("V5 global mesh", () => {
  it("reaches quorum with 3 clouds", () => {
    process.env.THEME_EXPERIMENT_GLOBAL_MESH = "1";
    const { json, snap } = ingestGlobalMeshOutcomes(null, [
      { cloud: "aws", region: "us-east-1", armId: "draft", conversions: 10, checkouts: 100, liftPp: 2 },
      { cloud: "gcp", region: "us-central1", armId: "draft", conversions: 12, checkouts: 110, liftPp: 2.1 },
      { cloud: "azure", region: "eastus", armId: "draft", conversions: 11, checkouts: 105, liftPp: 1.9 },
    ]);
    expect(snap.quorumReached).toBe(true);
    expect(evaluateGlobalMeshPublishGate(json).passed).toBe(true);
  });
});

describe("V3 IRAP Essential Eight", () => {
  it("builds AU evidence", () => {
    const ev = buildIrapEssentialEightEvidence();
    expect(ev.controls.length).toBeGreaterThan(0);
    expect(["M1", "M2", "M3"]).toContain(ev.essentialEightMaturity);
  });
});

describe("V4 NIST AI RMF", () => {
  it("seeds from EO pack", () => {
    process.env.THEME_EXPERIMENT_NIST_AI_RMF = "1";
    process.env.THEME_EXPERIMENT_EO_14110_INVENTORY = "1";
    const eu = mergeEuAiActPack(null, {
      at: new Date().toISOString(),
      modelCard: buildDefaultAssignmentModelCard(),
      oversightLog: [],
      transparencyUrl: null,
    });
    const eo = mergeEo14110InventoryPack(eu, seedEo14110FromEuUkPacks(eu));
    const pack = seedNistAiRmfFromCompliancePacks(eo);
    const merged = mergeNistAiRmfPack(eo, pack);
    expect(evaluateNistAiRmfPublishGate(merged).passed).toBe(true);
  });
});
