import { describe, expect, it } from "vitest";

import { appendDnaAuditBlock } from "@/lib/compliance/dna-encoded-audit-trail";
import {
  evaluatePqcDnaArchivalGate,
  sealPqcDnaArchivalFromTrail,
} from "@/lib/compliance/pqc-dna-archival";
import {
  evaluateWetwareCalibrationGate,
  recordWetwareOutcome,
} from "@/lib/storefront/theme-experiment-wetware-calibration";
import {
  evaluateCislunarDtnPublishGate,
  ingestCislunarBpv7Bundle,
} from "@/lib/storefront/theme-experiment-cislunar-dtn";
import { ingestGlobalMeshOutcomes } from "@/lib/storefront/theme-experiment-global-mesh";
import {
  buildPspfNzDtaEvidence,
  evaluatePspfNzDtaPublishGate,
} from "@/lib/compliance/pspf-nz-dta-crosswalk";
import {
  evaluateIso42001Stage2PublishGate,
  mergeIso42001Stage2Pack,
  seedIso42001Stage2FromW4,
} from "@/lib/compliance/iso-42001-stage2";
import { mergeIso42001AiMsPack, seedIso42001FromRmfAndEu } from "@/lib/compliance/iso-42001-ai-ms";
import { mergeNistAiRmfPack, seedNistAiRmfFromCompliancePacks } from "@/lib/compliance/nist-ai-rmf";
import { mergeEo14110InventoryPack, seedEo14110FromEuUkPacks } from "@/lib/compliance/eo-14110-ai-inventory";
import { mergeEuAiActPack, buildDefaultAssignmentModelCard } from "@/lib/compliance/eu-ai-act";

describe("X1 post-quantum DNA archival", () => {
  it("seals DNA blocks with ML-DSA fingerprints", () => {
    process.env.THEME_EXPERIMENT_PQC_DNA_ARCHIVAL = "1";
    process.env.THEME_EXPERIMENT_DNA_AUDIT_TRAIL = "1";
    process.env.THEME_EXPERIMENT_QUANTUM_SAFE = "1";

    const { json } = appendDnaAuditBlock(null, {
      eventType: "exposure",
      payload: { arm: "draft" },
    });
    const sealed = sealPqcDnaArchivalFromTrail(json);
    expect(sealed.snap.sealedBlockCount).toBe(1);
    expect(sealed.snap.seals[0]?.mldsaFingerprint.length).toBeGreaterThan(32);
    expect(evaluatePqcDnaArchivalGate(sealed.json).passed).toBe(true);
  });
});

describe("X2 online wetware calibration", () => {
  it("calibrates after enough outcomes", () => {
    process.env.THEME_EXPERIMENT_WETWARE_CALIBRATION = "1";
    process.env.THEME_EXPERIMENT_WETWARE_MIN_OUTCOMES = "5";
    process.env.THEME_EXPERIMENT_BIO_NEURON_ASSIGN = "1";
    process.env.THEME_EXPERIMENT_NEUROMORPHIC_ASSIGN = "1";

    const snap = {
      at: new Date().toISOString(),
      explorationPercent: 10,
      regretPp: 0,
      featureDim: 2,
      arms: [
        { armId: "published", theta: [1], weight: 50 },
        { armId: "draft", theta: [2], weight: 50 },
      ],
    };

    let json: Record<string, unknown> = {};
    let last = recordWetwareOutcome(json, {
      armId: "draft",
      converted: true,
      snapshot: snap,
    });
    json = last.json;
    for (let i = 1; i < 5; i++) {
      last = recordWetwareOutcome(json, {
        armId: "draft",
        converted: i % 2 === 0,
        snapshot: snap,
      });
      json = last.json;
    }
    expect(last.snap.calibrated).toBe(true);
    expect(evaluateWetwareCalibrationGate(json).passed).toBe(true);
  });
});

describe("X5 cislunar DTN production", () => {
  it("ingests BPv7 bundles with mesh quorum", () => {
    process.env.THEME_EXPERIMENT_CISLUNAR_DTN = "1";
    process.env.THEME_EXPERIMENT_DTN_MESH = "1";
    process.env.THEME_EXPERIMENT_GLOBAL_MESH = "1";
    process.env.THEME_EXPERIMENT_CISLUNAR_LATENCY_SLO_MS = "180000";

    let json: Record<string, unknown> = {};
    for (const sourceNode of ["leo", "geo_relay", "lunar_relay"] as const) {
      const r = ingestCislunarBpv7Bundle(json, {
        sourceNode,
        targetNode: "earth",
        latencyMs: sourceNode === "leo" ? 400 : 1500,
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
    expect(evaluateCislunarDtnPublishGate(meshMerged.json).passed).toBe(true);
  });
});

describe("X3 PSPF + NZ DTA", () => {
  it("builds crosswalk from ISMAP/NZISM", () => {
    process.env.THEME_EXPERIMENT_PSPF_NZ_DTA = "1";
    process.env.THEME_EXPERIMENT_ISMAP_NZISM = "1";
    process.env.THEME_EXPERIMENT_IRAP_ESSENTIAL8 = "1";
    const ev = buildPspfNzDtaEvidence();
    expect(ev.controls.some((c) => c.framework === "PSPF")).toBe(true);
    expect(ev.controls.some((c) => c.framework === "NZ-DTA")).toBe(true);
    expect(evaluatePspfNzDtaPublishGate(null).passed).toBe(ev.pspfReady && ev.nzDtaReady);
  });
});

describe("X4 ISO 42001 Stage 2", () => {
  it("seeds surveillance pack from W4", () => {
    process.env.THEME_EXPERIMENT_ISO_42001_STAGE2 = "1";
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
    const ms = mergeIso42001AiMsPack(rmf, seedIso42001FromRmfAndEu(rmf));
    const stage2 = seedIso42001Stage2FromW4(ms);
    const merged = mergeIso42001Stage2Pack(ms, stage2);
    expect(evaluateIso42001Stage2PublishGate(merged).passed).toBe(true);
  });
});
