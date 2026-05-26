import { describe, expect, it } from "vitest";

import {
  appendDnaAuditBlock,
  encodeHashToDna,
  evaluateDnaAuditTrailGate,
  readDnaAuditTrail,
} from "@/lib/compliance/dna-encoded-audit-trail";
import {
  assignArmBioNeuronKernel,
  shouldUseBioNeuronAssign,
  bioNeuronMinFactorialCells,
} from "@/lib/storefront/theme-experiment-bio-neuron-assign";
import { seedCompositionalExperiment } from "@/lib/storefront/theme-experiment-compositional-ui";
import {
  ingestDtnBundle,
  evaluateDtnMeshPublishGate,
} from "@/lib/storefront/theme-experiment-dtn-mesh";
import { ingestGlobalMeshOutcomes } from "@/lib/storefront/theme-experiment-global-mesh";
import {
  buildIsmapNzismEvidence,
  evaluateIsmapNzismPublishGate,
} from "@/lib/compliance/ismap-nzism-crosswalk";
import {
  evaluateIso42001AiMsPublishGate,
  mergeIso42001AiMsPack,
  seedIso42001FromRmfAndEu,
} from "@/lib/compliance/iso-42001-ai-ms";
import { mergeNistAiRmfPack, seedNistAiRmfFromCompliancePacks } from "@/lib/compliance/nist-ai-rmf";
import { mergeEo14110InventoryPack, seedEo14110FromEuUkPacks } from "@/lib/compliance/eo-14110-ai-inventory";
import { mergeEuAiActPack, buildDefaultAssignmentModelCard } from "@/lib/compliance/eu-ai-act";

describe("W1 DNA-encoded audit trail", () => {
  it("appends valid hash chain with ATGC encoding", () => {
    process.env.THEME_EXPERIMENT_DNA_AUDIT_TRAIL = "1";
    const { json, chainValid, block } = appendDnaAuditBlock(null, {
      eventType: "experiment_exposure",
      payload: { arm: "draft", visitorId: "v1" },
    });
    expect(chainValid).toBe(true);
    expect(block.dnaSequence).toMatch(/^[ATGC]+$/);
    expect(encodeHashToDna(block.blockHash).length).toBeGreaterThan(0);
    const trail = readDnaAuditTrail(json);
    expect(trail?.blocks.length).toBe(1);
    const second = appendDnaAuditBlock(json, {
      eventType: "checkout",
      payload: { arm: "draft" },
    });
    expect(second.chainValid).toBe(true);
    expect(second.block.previousHash).toBe(block.blockHash);
    expect(evaluateDnaAuditTrailGate(second.json).passed).toBe(true);
  });
});

describe("W2 biological neuron assign", () => {
  it("activates above 64 factorial cells", () => {
    process.env.THEME_EXPERIMENT_BIO_NEURON_ASSIGN = "1";
    process.env.THEME_EXPERIMENT_BIO_NEURON_MIN_CELLS = "64";
    const json = seedCompositionalExperiment({
      previousRaw: null,
      headerVariants: ["a", "b", "c", "d", "e", "f", "g"],
      heroVariants: ["x", "y", "z", "w", "v"],
      ctaVariants: ["1", "2", "3", "4"],
    });
    expect(shouldUseBioNeuronAssign(json)).toBe(true);
    expect(bioNeuronMinFactorialCells()).toBe(64);
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
    const r = assignArmBioNeuronKernel({
      storeSlug: "cafe",
      visitorId: "v-bio",
      snapshot: snap,
      defaultWeights: { published: 50, draft: 50 },
      themeExperimentJson: json,
    });
    expect(r.armId).toBeTruthy();
    expect(r.actionPotentials).toBeGreaterThanOrEqual(0);
  });
});

describe("W5 DTN interplanetary mesh", () => {
  it("merges delivered bundles into global mesh", () => {
    process.env.THEME_EXPERIMENT_DTN_MESH = "1";
    process.env.THEME_EXPERIMENT_GLOBAL_MESH = "1";
    process.env.THEME_EXPERIMENT_DTN_MAX_LATENCY_MS = "120000";

    let json: Record<string, unknown> = {};
    for (const sourceNode of ["leo", "lunar_relay"] as const) {
      const latencyMs = sourceNode === "leo" ? 500 : 3000;
      const r = ingestDtnBundle(json, {
        sourceNode,
        targetNode: "earth",
        latencyMs,
        cloud: "aws",
        region: sourceNode,
        armId: "draft",
        conversions: 10,
        checkouts: 100,
        liftPp: 2,
      });
      json = r.json;
    }

    const meshMerged = ingestGlobalMeshOutcomes(json, [
      { cloud: "gcp", region: "us-central1", armId: "draft", conversions: 12, checkouts: 110, liftPp: 2 },
      { cloud: "azure", region: "eastus", armId: "draft", conversions: 11, checkouts: 105, liftPp: 1.9 },
    ]);
    expect(meshMerged.snap.quorumReached).toBe(true);
    expect(evaluateDtnMeshPublishGate(meshMerged.json).passed).toBe(true);
  });
});

describe("W3 ISMAP + NZISM", () => {
  it("builds AU/NZ government crosswalk", () => {
    process.env.THEME_EXPERIMENT_ISMAP_NZISM = "1";
    process.env.THEME_EXPERIMENT_IRAP_ESSENTIAL8 = "1";
    const ev = buildIsmapNzismEvidence();
    expect(ev.controls.some((c) => c.framework === "ISMAP")).toBe(true);
    expect(ev.controls.some((c) => c.framework === "NZISM")).toBe(true);
    expect(evaluateIsmapNzismPublishGate(null).passed).toBe(ev.ismapReady && ev.nzismReady);
  });
});

describe("W4 ISO 42001 AI MS", () => {
  it("seeds from NIST RMF + EU AI Act", () => {
    process.env.THEME_EXPERIMENT_ISO_42001 = "1";
    process.env.THEME_EXPERIMENT_NIST_AI_RMF = "1";
    process.env.THEME_EXPERIMENT_EU_AI_ACT = "1";
    const eu = mergeEuAiActPack(null, {
      at: new Date().toISOString(),
      modelCard: buildDefaultAssignmentModelCard(),
      oversightLog: [{ at: new Date().toISOString(), actor: "ops", action: "review" }],
      transparencyUrl: "https://example.com/ai",
    });
    const eo = mergeEo14110InventoryPack(eu, seedEo14110FromEuUkPacks(eu));
    const rmf = mergeNistAiRmfPack(eo, seedNistAiRmfFromCompliancePacks(eo));
    const pack = seedIso42001FromRmfAndEu(rmf);
    const merged = mergeIso42001AiMsPack(rmf, pack);
    expect(evaluateIso42001AiMsPublishGate(merged).passed).toBe(true);
  });
});
