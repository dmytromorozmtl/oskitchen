import { describe, expect, it } from "vitest";

import { appendDnaAuditBlock } from "@/lib/compliance/dna-encoded-audit-trail";
import { sealPqcDnaArchivalFromTrail } from "@/lib/compliance/pqc-dna-archival";
import { mergeHomomorphicDnaFederation } from "@/lib/compliance/homomorphic-dna-federation";
import {
  batchRecursiveZkFromRollups,
  evaluateRecursiveZkDnaRollupGate,
} from "@/lib/compliance/recursive-zk-dna-rollup";
import {
  evaluateHypergraphZkDnaGate,
  rollupHypergraphFromRecursive,
} from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { rollupZkDnaFromFederation } from "@/lib/compliance/zk-dna-rollup";
import {
  encryptArmMetricsCell,
  ingestHomomorphicArmBatch,
  mergeHomomorphicMetrics,
} from "@/lib/storefront/theme-experiment-homomorphic-metrics";
import { seedCompositionalExperiment } from "@/lib/storefront/theme-experiment-compositional-ui";
import {
  mergeWetwareCalibration,
  type WetwareCalibrationSnapshot,
} from "@/lib/storefront/theme-experiment-wetware-calibration";
import { mergeCorticalOrganoidMesh } from "@/lib/storefront/theme-experiment-cortical-organoid-mesh";
import { mergeHippocampalOrganoidMesh } from "@/lib/storefront/theme-experiment-hippocampal-organoid-mesh";
import {
  evaluatePrefrontalOrganoidMeshGate,
  mergePrefrontalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";

const synapsePair = [
  { armId: "published", weight: 50, lastOutcome: "neutral" as const, plasticity: 1.1, updates: 5 },
  { armId: "draft", weight: 50, lastOutcome: "neutral" as const, plasticity: 1.1, updates: 5 },
];

function buildZkChainJson(): Record<string, unknown> {
  let json: Record<string, unknown> = {};
  const dna = appendDnaAuditBlock(null, { eventType: "e", payload: { x: 1 } });
  json = sealPqcDnaArchivalFromTrail(dna.json).json;
  const hom = ingestHomomorphicArmBatch(json, [
    encryptArmMetricsCell({ armId: "draft", conversions: 5, checkouts: 50 }),
    encryptArmMetricsCell({ armId: "published", conversions: 4, checkouts: 48 }),
  ]);
  json = mergeHomomorphicMetrics(json, hom);
  json = mergeHomomorphicDnaFederation(json, [
    {
      at: new Date().toISOString(),
      storeSlug: "peer-a",
      blockIndex: 0,
      mldsaFingerprint: "a".repeat(64),
      fheCiphertextHash: "abc",
      kemBindingHash: "kem-a",
    },
  ]).json;
  json = rollupZkDnaFromFederation(json).json;
  const batched = batchRecursiveZkFromRollups(json);
  expect(evaluateRecursiveZkDnaRollupGate(batched.json).passed).toBe(true);
  return batched.json;
}

describe("AC1 hypergraph ZK DNA", () => {
  it("builds Merkle-DAG proof over recursive batches", () => {
    process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA = "1";
    process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP = "1";
    process.env.THEME_EXPERIMENT_ZK_DNA_ROLLUP = "1";
    process.env.THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS = "1";
    process.env.THEME_EXPERIMENT_HOMOMORPHIC_DNA_FEDERATION = "1";
    process.env.THEME_EXPERIMENT_PQC_DNA_ARCHIVAL = "1";
    process.env.THEME_EXPERIMENT_DNA_AUDIT_TRAIL = "1";
    process.env.THEME_EXPERIMENT_HOMOMORPHIC_METRICS = "1";
    process.env.THEME_EXPERIMENT_DNA_FEDERATION_QUORUM = "2";

    const json = buildZkChainJson();
    const hg = rollupHypergraphFromRecursive(json);
    expect(hg.proof?.verified).toBe(true);
    expect(evaluateHypergraphZkDnaGate(hg.json).passed).toBe(true);
  });
});

describe("AC2 prefrontal organoid mesh", () => {
  it("executive gates hippocampal windows", () => {
    process.env.THEME_EXPERIMENT_PREFRONTAL_ORGANOID_MESH = "1";
    process.env.THEME_EXPERIMENT_HIPPOCAMPAL_ORGANOID_MESH = "1";
    process.env.THEME_EXPERIMENT_CORTICAL_ORGANOID_MESH = "1";
    process.env.THEME_EXPERIMENT_ORGANOID_WETWARE = "1";
    process.env.THEME_EXPERIMENT_BIO_NEURON_ASSIGN = "1";
    process.env.THEME_EXPERIMENT_WETWARE_CALIBRATION = "1";

    let json = seedCompositionalExperiment({
      previousRaw: null,
      headerVariants: ["a", "b", "c", "d", "e", "f", "g"],
      heroVariants: ["x", "y", "z", "w", "v"],
      ctaVariants: ["1", "2", "3", "4"],
    });
    const wet: WetwareCalibrationSnapshot = {
      at: new Date().toISOString(),
      synapses: synapsePair,
      learningRate: 0.1,
      calibrated: true,
      totalOutcomes: 12,
    };
    json = mergeWetwareCalibration(json, wet);
    json = mergeCorticalOrganoidMesh(json, "cafe", [
      { storeSlug: "peer-b", synapses: synapsePair },
      { storeSlug: "peer-c", synapses: synapsePair },
    ]).json;
    json = mergeHippocampalOrganoidMesh(json).json;

    const pfc = mergePrefrontalOrganoidMesh(json);
    expect(pfc.snap.prefrontalSynced).toBe(true);
    expect(evaluatePrefrontalOrganoidMeshGate(pfc.json).passed).toBe(true);
  });
});
