import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { evaluateStrictEnvGate, collectStrictEnvIssues } from "@/lib/experiment-production/strict-env-validator";
import { evaluateProductionHardeningGate } from "@/lib/experiment-production/production-hardening-gate";
import { evaluateHypergraphZkDnaGate } from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { evaluatePrefrontalOrganoidMeshGate } from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";
import { evaluateIndoPacificCompactGate } from "@/lib/compliance/indo-pacific-compact";
import { evaluateHypergraphEvolutionGate } from "@/lib/compliance/hypergraph-evolution";
import { evaluatePanPacificQuantumMeshGate } from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";
import { evaluateHypergraphL3RecursiveAnchorGate } from "@/lib/compliance/hypergraph-l3-recursive-anchor";
import { evaluateArcticQuantumMeshGate } from "@/lib/storefront/theme-experiment-arctic-quantum-mesh";
import { evaluateHypergraphL4MetaAnchorGate } from "@/lib/compliance/hypergraph-l4-meta-anchor";
import { evaluateAntarcticSubglacialMeshGate } from "@/lib/storefront/theme-experiment-antarctic-subglacial-mesh";
import { evaluateEuAiActArt71PmmLiveGate, ingestEuAiActArt71PmmEvent } from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import { evaluateHypergraphL5CompositionalAnchorGate } from "@/lib/compliance/hypergraph-l5-compositional-anchor";

describe("publish gates — strict env blocks partial enable", () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("strict mode fails when recursive ZK enabled without Z1", () => {
    process.env.THEME_EXPERIMENT_STRICT_PUBLISH_GATES = "1";
    process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP = "1";
    delete process.env.THEME_EXPERIMENT_ZK_DNA_ROLLUP;

    const gate = evaluateStrictEnvGate();
    expect(gate.passed).toBe(false);
    expect(collectStrictEnvIssues().length).toBeGreaterThan(0);
  });

  it("strict mode passes when dependency chain complete", () => {
    process.env.THEME_EXPERIMENT_STRICT_PUBLISH_GATES = "1";
    process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA = "1";
    process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP = "1";
    process.env.THEME_EXPERIMENT_ZK_DNA_ROLLUP = "1";
    process.env.THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS = "1";

    expect(evaluateStrictEnvGate().passed).toBe(true);
  });

  it("AC gates off pass by default", () => {
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA;
    delete process.env.THEME_EXPERIMENT_PREFRONTAL_ORGANOID_MESH;
    delete process.env.THEME_EXPERIMENT_PRODUCTION_HARDENING;

    expect(evaluateHypergraphZkDnaGate(null).passed).toBe(true);
    expect(evaluatePrefrontalOrganoidMeshGate(null).passed).toBe(true);
    expect(evaluateProductionHardeningGate(null).passed).toBe(true);
  });

  it("AC1 hypergraph without AA1 recursive fails gate when enabled", () => {
    process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA = "1";
    delete process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP;

    expect(evaluateHypergraphZkDnaGate(null).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA;
  });

  it("AD3 hypergraph evolution without AC1 verified DAG fails", () => {
    process.env.THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION = "1";
    process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA = "1";
    delete process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP;

    expect(evaluateHypergraphEvolutionGate(null).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION;
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA;
  });

  it("AD1 indo-pacific without Five Eyes+ fails when enabled", () => {
    process.env.THEME_EXPERIMENT_INDO_PACIFIC_COMPACT = "1";
    delete process.env.THEME_EXPERIMENT_FIVE_EYES_PLUS_COMPACT;

    expect(evaluateIndoPacificCompactGate(null).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_INDO_PACIFIC_COMPACT;
  });

  it("AE1 pan-Pacific without AD1 fails when enabled", () => {
    process.env.THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH = "1";
    delete process.env.THEME_EXPERIMENT_INDO_PACIFIC_COMPACT;
    expect(evaluatePanPacificQuantumMeshGate(null).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH;
  });

  it("AE3 L3 without AD3 L2 evolution fails when enabled", () => {
    process.env.THEME_EXPERIMENT_HYPERGRAPH_L3_RECURSIVE_ANCHOR = "1";
    process.env.THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION = "1";
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA;
    expect(evaluateHypergraphL3RecursiveAnchorGate(null).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_L3_RECURSIVE_ANCHOR;
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION;
  });

  it("AF1 arctic without AE1 pan-Pacific fails when enabled", () => {
    process.env.THEME_EXPERIMENT_ARCTIC_QUANTUM_MESH = "1";
    delete process.env.THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH;
    expect(evaluateArcticQuantumMeshGate(null).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_ARCTIC_QUANTUM_MESH;
  });

  it("AF3 L4 without AE3 L3 fails when enabled", () => {
    process.env.THEME_EXPERIMENT_HYPERGRAPH_L4_META_ANCHOR = "1";
    process.env.THEME_EXPERIMENT_HYPERGRAPH_L3_RECURSIVE_ANCHOR = "1";
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION;
    expect(evaluateHypergraphL4MetaAnchorGate(null).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_L4_META_ANCHOR;
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_L3_RECURSIVE_ANCHOR;
  });

  it("AG1 subglacial without AF1 arctic fails when enabled", () => {
    process.env.THEME_EXPERIMENT_ANTARCTIC_SUBGLACIAL_MESH = "1";
    delete process.env.THEME_EXPERIMENT_ARCTIC_QUANTUM_MESH;
    expect(evaluateAntarcticSubglacialMeshGate(null).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_ANTARCTIC_SUBGLACIAL_MESH;
  });

  it("AG2 PMM blocks publish on serious incident when enabled", () => {
    process.env.THEME_EXPERIMENT_EU_AI_ACT_ART71_PMM_LIVE = "1";
    const { json } = ingestEuAiActArt71PmmEvent(null, {
      source: "poll",
      incidentId: "x",
      severity: "serious",
      status: "open",
      modelDeploymentId: "d",
      syncedToPmmFeed: true,
    });
    expect(evaluateEuAiActArt71PmmLiveGate(json).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_EU_AI_ACT_ART71_PMM_LIVE;
  });

  it("AG3 L5 without AF3 L4 fails when enabled", () => {
    process.env.THEME_EXPERIMENT_HYPERGRAPH_L5_COMPOSITIONAL_ANCHOR = "1";
    process.env.THEME_EXPERIMENT_HYPERGRAPH_L4_META_ANCHOR = "1";
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION;
    expect(evaluateHypergraphL5CompositionalAnchorGate(null).passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_L5_COMPOSITIONAL_ANCHOR;
    delete process.env.THEME_EXPERIMENT_HYPERGRAPH_L4_META_ANCHOR;
  });

  it("strict mode blocks AD1 without AA3 dependency", () => {
    process.env.THEME_EXPERIMENT_STRICT_PUBLISH_GATES = "1";
    process.env.THEME_EXPERIMENT_INDO_PACIFIC_COMPACT = "1";
    delete process.env.THEME_EXPERIMENT_FIVE_EYES_PLUS_COMPACT;

    expect(evaluateStrictEnvGate().passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_STRICT_PUBLISH_GATES;
    delete process.env.THEME_EXPERIMENT_INDO_PACIFIC_COMPACT;
  });
});
