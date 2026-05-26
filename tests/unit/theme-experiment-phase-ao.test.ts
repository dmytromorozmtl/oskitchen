import { describe, expect, it } from "vitest";

import {
  evaluatePlutoCharonBinaryDtnBarycenterGate,
  syncPlutoCharonFromBinaryBarycenter,
} from "@/lib/storefront/theme-experiment-pluto-charon-binary-dtn-barycenter";
import {
  evaluateKuiperScatteredDiskDtnAphelionGate,
  syncKuiperAphelionFromScatteredDisk,
} from "@/lib/storefront/theme-experiment-kuiper-scattered-disk-dtn-aphelion";
import {
  evaluateIsoIecAiStandardsHarmonizationRegistryGate,
  ingestIsoIecStandardsHarmonizationEvent,
  pollIsoIecAiStandardsHarmonizationRegistry,
} from "@/lib/compliance/iso-iec-ai-standards-harmonization-registry";
import {
  evaluateCenCenelecDigitalProductGovernanceRegistryGate,
  ingestCenCenelecGovernanceEvent,
  pollCenCenelecDigitalProductGovernanceRegistry,
} from "@/lib/compliance/cen-cenelec-digital-product-governance-registry";
import { recordEuAiOfficeAssessment } from "@/lib/compliance/eu-ai-office-notified-body";
import { ingestUnAiOfficeRegistryEvent } from "@/lib/compliance/un-ai-office-global-registry-mesh";
import {
  evaluateItuUncitralDigitalCommerceAiRegistryGate,
  ingestItuUncitralDigitalCommerceEvent,
  pollItuUncitralDigitalCommerceRegistry,
} from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";
import { collapseMultiverseFromCosmicWeb } from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";
import { syncCosmicWebFromPeers } from "@/lib/storefront/theme-experiment-cosmic-web-federation";
import { buildOmniverseFromMultiverse } from "@/lib/storefront/theme-experiment-omniverse-causal-graph-crdt";
import { buildCounterfactualsFromOmniverse } from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";
import { mergeParallelUniversesFromCounterfactuals } from "@/lib/storefront/theme-experiment-parallel-universe-merge-crdt";
import { reconcileMultiverseFromParallelUniverses } from "@/lib/storefront/theme-experiment-multiverse-reconciliation-crdt";
import { sealOmniverseEpochFromReconciliation } from "@/lib/storefront/theme-experiment-omniverse-epoch-seal-crdt";
import { sealMetaverseFinalityFromEpoch } from "@/lib/storefront/theme-experiment-metaverse-finality-seal-crdt";
import { lockMultiverseCausalityFromFinality } from "@/lib/storefront/theme-experiment-multiverse-causality-lock-crdt";
import { freezeOmniverseEpochFromCausalityLock } from "@/lib/storefront/theme-experiment-omniverse-epoch-freeze-crdt";
import {
  evaluateMultiverseTimelineSealCrdtGate,
  sealMultiverseTimelineFromEpochFreeze,
} from "@/lib/storefront/theme-experiment-multiverse-timeline-seal-crdt";
import {
  evaluateMultiverseBranchMergeSealCrdtGate,
  sealMultiverseBranchMergeFromTimeline,
} from "@/lib/storefront/theme-experiment-multiverse-branch-merge-seal-crdt";
import {
  evaluateHypergraphL12CategoricalQuantumAnchorGate,
  categoricalQuantumAnchorL12FromL11Stack,
} from "@/lib/compliance/hypergraph-l12-categorical-quantum-anchor";
import {
  evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate,
  homotopyTypeTheoreticAnchorL13FromL12Stack,
} from "@/lib/compliance/hypergraph-l13-homotopy-type-theoretic-anchor";
import {
  evaluateHypergraphL11TopologicalFaultTolerantAnchorGate,
  topologicalFaultTolerantAnchorL11FromL10Stack,
} from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";
import { recordMedullaEmergencyHalt } from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";
import { syncPonsFromMedullaAndSpinal } from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import { syncMidbrainFromPonsAndSpinal } from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import { syncThalamusFromMidbrainAndSpinal } from "@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish";
import { syncBasalGangliaFromThalamusAndMidbrain } from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";
import {
  evaluateCerebellumMotorRefinementPublishGate,
  syncCerebellumFromBasalGangliaAndMidbrain,
} from "@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish";
import {
  evaluateMotorCortexExecutionPublishGate,
  syncMotorCortexFromCerebellumAndMidbrain,
} from "@/lib/storefront/theme-experiment-motor-cortex-execution-publish";
import {
  evaluatePremotorSmaPlanningPublishGate,
  syncPremotorSmaFromMotorCortexAndEthics,
} from "@/lib/storefront/theme-experiment-premotor-sma-planning-publish";
import { syncNeptuneHaloFromTritonRetrograde } from "@/lib/storefront/theme-experiment-neptune-triton-retrograde-dtn-halo";
import { syncUranusPolarFromObliquityTilt } from "@/lib/storefront/theme-experiment-uranus-obliquity-dtn-polar-relay";
import { syncSaturnRingFromShepherdPan } from "@/lib/storefront/theme-experiment-saturn-ring-dtn-shepherd";
import { syncJupiterTrojanFromLagrangePoints } from "@/lib/storefront/theme-experiment-jupiter-trojan-dtn-lagrange";
import { syncMartianOrbitalFromOlympusValles } from "@/lib/storefront/theme-experiment-martian-orbital-dtn-relay";
import { syncLunarFarsideFromShackletonMalapert } from "@/lib/storefront/theme-experiment-lunar-farside-dtn-mesh";
import { syncAntarcticSubglacialFromMcmurdoPalmer } from "@/lib/storefront/theme-experiment-antarctic-subglacial-mesh";
import { syncArcticFromGreenlandIcelandRelays } from "@/lib/storefront/theme-experiment-arctic-quantum-mesh";
import { syncPanPacificFromTasmanRelays } from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";
import { appendDnaAuditBlock } from "@/lib/compliance/dna-encoded-audit-trail";
import { sealPqcDnaArchivalFromTrail } from "@/lib/compliance/pqc-dna-archival";
import { DTN_NODES, ingestDtnBundle } from "@/lib/storefront/theme-experiment-dtn-mesh";
import { ingestHeliopauseBundle } from "@/lib/storefront/theme-experiment-heliopause-dtn";
import { ingestCislunarBpv7Bundle } from "@/lib/storefront/theme-experiment-cislunar-dtn";
import { ingestGlobalMeshOutcomes } from "@/lib/storefront/theme-experiment-global-mesh";
import { ingestGalacticMeshOutcomes } from "@/lib/storefront/theme-experiment-galactic-mesh";
import {
  ingestIntergalacticFederationOutcomes,
  LANIAKEA_CLUSTERS,
} from "@/lib/storefront/theme-experiment-intergalactic-mesh-federation";
import { compositionalAnchorL5FromL4Stack } from "@/lib/compliance/hypergraph-l5-compositional-anchor";
import { holographicAnchorL6FromL5Stack } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import { entanglementAnchorL7FromL6Stack } from "@/lib/compliance/hypergraph-l7-entanglement-anchor";
import { faultTolerantAnchorL8FromL7Stack } from "@/lib/compliance/hypergraph-l8-fault-tolerant-anchor";
import { byzantineAnchorL9FromL8Stack } from "@/lib/compliance/hypergraph-l9-byzantine-anchor";
import { quantumResilientAnchorL10FromL9Stack } from "@/lib/compliance/hypergraph-l10-quantum-resilient-anchor";
import { batchRecursiveZkFromRollups, evaluateRecursiveZkDnaRollupGate } from "@/lib/compliance/recursive-zk-dna-rollup";
import { rollupHypergraphFromRecursive } from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { evolveHypergraphFromVerifiedDag } from "@/lib/compliance/hypergraph-evolution";
import { recursiveAnchorL3FromEvolution } from "@/lib/compliance/hypergraph-l3-recursive-anchor";
import { metaAnchorL4FromL3Stack } from "@/lib/compliance/hypergraph-l4-meta-anchor";
import {
  encryptArmMetricsCell,
  ingestHomomorphicArmBatch,
  mergeHomomorphicMetrics,
} from "@/lib/storefront/theme-experiment-homomorphic-metrics";
import { mergeHomomorphicDnaFederation } from "@/lib/compliance/homomorphic-dna-federation";
import { rollupZkDnaFromFederation } from "@/lib/compliance/zk-dna-rollup";

function buildKuiperStackJson(): Record<string, unknown> {
  process.env.THEME_EXPERIMENT_KUIPER_SCATTERED_DISK_DTN_APHELION = "1";
  process.env.THEME_EXPERIMENT_PLUTO_CHARON_BINARY_DTN_BARYCENTER = "1";
  process.env.THEME_EXPERIMENT_NEPTUNE_TRITON_RETROGRADE_DTN_HALO = "1";
  process.env.THEME_EXPERIMENT_URANUS_OBLIQUITY_DTN_POLAR_RELAY = "1";
  process.env.THEME_EXPERIMENT_SATURN_RING_DTN_SHEPHERD = "1";
  process.env.THEME_EXPERIMENT_JUPITER_TROJAN_DTN_LAGRANGE = "1";
  process.env.THEME_EXPERIMENT_MARTIAN_ORBITAL_DTN_RELAY = "1";
  process.env.THEME_EXPERIMENT_LUNAR_FARSIDE_DTN_MESH = "1";
  process.env.THEME_EXPERIMENT_ANTARCTIC_SUBGLACIAL_MESH = "1";
  process.env.THEME_EXPERIMENT_ARCTIC_QUANTUM_MESH = "1";
  process.env.THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH = "1";
  process.env.THEME_EXPERIMENT_DTN_MESH = "1";
  process.env.THEME_EXPERIMENT_GLOBAL_MESH = "1";
  process.env.THEME_EXPERIMENT_HELIOPAUSE_DTN = "1";
  process.env.THEME_EXPERIMENT_CISLUNAR_DTN = "1";
  process.env.THEME_EXPERIMENT_DNA_AUDIT_TRAIL = "1";
  process.env.THEME_EXPERIMENT_PQC_DNA_ARCHIVAL = "1";

  let json: Record<string, unknown> = {};
  const dna = appendDnaAuditBlock(null, { eventType: "e", payload: {} });
  json = sealPqcDnaArchivalFromTrail(dna.json).json;
  json = syncPanPacificFromTasmanRelays(json).json;
  json = syncArcticFromGreenlandIcelandRelays(json).json;
  json = syncAntarcticSubglacialFromMcmurdoPalmer(json).json;
  json = ingestHeliopauseBundle(json, {
    sourceNode: "heliopause_relay",
    targetNode: "earth",
    latencyMs: 1000,
    cloud: "aws",
    region: "helio",
    armId: "draft",
    conversions: 5,
    checkouts: 50,
    liftPp: 1.5,
    delivered: true,
  }).json;
  json = ingestCislunarBpv7Bundle(json, {
    sourceNode: "geo_relay",
    targetNode: "earth",
    latencyMs: 500,
    cloud: "gcp",
    region: "geo",
    armId: "draft",
    conversions: 5,
    checkouts: 50,
    liftPp: 1.5,
    delivered: true,
  }).json;
  for (const node of DTN_NODES) {
    json = ingestDtnBundle(json, {
      sourceNode: node,
      targetNode: "earth",
      latencyMs: 800,
      cloud: "aws",
      region: node,
      armId: "draft",
      conversions: 5,
      checkouts: 50,
      liftPp: 1.5,
      delivered: true,
    }).json;
  }
  json = ingestGlobalMeshOutcomes(json, [
    { armId: "draft", conversions: 5, checkouts: 50, liftPp: 1.5, region: "us" },
  ]).json;
  json = ingestGalacticMeshOutcomes(json, [
    { armId: "draft", conversions: 5, checkouts: 50, liftPp: 1.5, arm: "milky_way" },
  ]).json;
  json = ingestIntergalacticFederationOutcomes(json, LANIAKEA_CLUSTERS.map((c) => ({
    clusterId: c,
    armId: "draft",
    conversions: 5,
    checkouts: 50,
    liftPp: 1.5,
  }))).json;
  json = syncLunarFarsideFromShackletonMalapert(json).json;
  json = syncMartianOrbitalFromOlympusValles(json).json;
  json = syncJupiterTrojanFromLagrangePoints(json).json;
  json = syncSaturnRingFromShepherdPan(json).json;
  json = syncUranusPolarFromObliquityTilt(json).json;
  json = syncNeptuneHaloFromTritonRetrograde(json).json;
  json = syncPlutoCharonFromBinaryBarycenter(json).json;
  return syncKuiperAphelionFromScatteredDisk(json).json;
}

function buildCosmicWebJson(): Record<string, unknown> {
  let json: Record<string, unknown> = {};
  for (let i = 0; i < 4; i++) {
    json = syncCosmicWebFromPeers(json, "cafe").json;
    json = collapseMultiverseFromCosmicWeb(json).json;
  }
  return syncCosmicWebFromPeers(json, "cafe").json;
}

function buildL13StackJson(): Record<string, unknown> {
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L13_HOMOTOPY_TYPE_THEORETIC_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L12_CATEGORICAL_QUANTUM_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L11_TOPOLOGICAL_FAULT_TOLERANT_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L10_QUANTUM_RESILIENT_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA = "1";
  process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP = "1";
  process.env.THEME_EXPERIMENT_ZK_DNA_ROLLUP = "1";
  process.env.THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS = "1";
  process.env.THEME_EXPERIMENT_HOMOMORPHIC_DNA_FEDERATION = "1";
  process.env.THEME_EXPERIMENT_PQC_DNA_ARCHIVAL = "1";
  process.env.THEME_EXPERIMENT_DNA_AUDIT_TRAIL = "1";
  process.env.THEME_EXPERIMENT_HOMOMORPHIC_METRICS = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L3_RECURSIVE_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L4_META_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L5_COMPOSITIONAL_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L6_HOLOGRAPHIC_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L7_ENTANGLEMENT_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L8_FAULT_TOLERANT_ANCHOR = "1";
  process.env.THEME_EXPERIMENT_HYPERGRAPH_L9_BYZANTINE_ANCHOR = "1";

  let json: Record<string, unknown> = {};
  const dna = appendDnaAuditBlock(null, { eventType: "e", payload: { x: 1 } });
  json = sealPqcDnaArchivalFromTrail(dna.json).json;
  const hom = ingestHomomorphicArmBatch(json, [
    encryptArmMetricsCell({ armId: "draft", conversions: 5, checkouts: 50 }),
  ]);
  json = mergeHomomorphicMetrics(json, hom);
  json = mergeHomomorphicDnaFederation(json, [
    {
      at: new Date().toISOString(),
      storeSlug: "peer",
      blockIndex: 0,
      mldsaFingerprint: "a".repeat(64),
      fheCiphertextHash: "abc",
      kemBindingHash: "kem",
    },
  ]).json;
  json = rollupZkDnaFromFederation(json).json;
  const batched = batchRecursiveZkFromRollups(json);
  expect(evaluateRecursiveZkDnaRollupGate(batched.json).passed).toBe(true);
  json = rollupHypergraphFromRecursive(batched.json).json;
  json = evolveHypergraphFromVerifiedDag(json).json;
  json = recursiveAnchorL3FromEvolution(json).json;
  const l4 = metaAnchorL4FromL3Stack(json);
  const l5 = compositionalAnchorL5FromL4Stack(l4.json);
  const l6 = holographicAnchorL6FromL5Stack(l5.json);
  const l7 = entanglementAnchorL7FromL6Stack(l6.json);
  const l8 = faultTolerantAnchorL8FromL7Stack(l7.json);
  const l9 = byzantineAnchorL9FromL8Stack(l8.json);
  const l10 = quantumResilientAnchorL10FromL9Stack(l9.json);
  const l11 = topologicalFaultTolerantAnchorL11FromL10Stack(l10.json);
  return l11.json;
}

describe("AO1 Kuiper scattered-disk DTN aphelion", () => {
  it("aphelion quorum over Pluto Charon barycenter", () => {
    const json = buildKuiperStackJson();
    expect(evaluatePlutoCharonBinaryDtnBarycenterGate(json).passed).toBe(true);
    expect(evaluateKuiperScatteredDiskDtnAphelionGate(json).passed).toBe(true);
  });
});

describe("AO2 CEN / CENELEC digital product governance registry", () => {
  it("governance bodies over standards and EU notified body", () => {
    process.env.THEME_EXPERIMENT_CEN_CENELEC_DIGITAL_PRODUCT_GOVERNANCE_REGISTRY = "1";
    process.env.THEME_EXPERIMENT_ISO_IEC_AI_STANDARDS_HARMONIZATION_REGISTRY = "1";
    process.env.THEME_EXPERIMENT_ITU_UNCITRAL_DIGITAL_COMMERCE_AI_REGISTRY = "1";
    process.env.THEME_EXPERIMENT_UN_AI_OFFICE_GLOBAL_REGISTRY_MESH = "1";
    process.env.THEME_EXPERIMENT_EU_AI_OFFICE_NOTIFIED_BODY = "1";
    let json: Record<string, unknown> = {};
    for (const r of ["un_hq_ny", "unog_geneva", "unesco_paris", "itu_geneva"] as const) {
      json = ingestUnAiOfficeRegistryEvent(json, {
        source: "poll",
        regionId: r,
        globalRecordId: `un-${r}`,
        modelDeploymentId: `deploy-${r}`,
        syncedToGlobalRegistry: true,
      }).json;
    }
    for (const c of ["itu_t_geneva", "uncitral_vienna", "wipo_digital", "itu_f_plenipot"] as const) {
      json = ingestItuUncitralDigitalCommerceEvent(json, {
        source: "poll",
        bodyId: c,
        commerceRecordId: `commerce-${c}`,
        digitalTradeAgreementId: `dta-${c}`,
        syncedToCommerceRegistry: true,
      }).json;
    }
    json = pollItuUncitralDigitalCommerceRegistry(json).json;
    for (const s of ["iso_iec_jtc21", "iec_sc42", "iso_iec_42001", "iec_62443_ai"] as const) {
      json = ingestIsoIecStandardsHarmonizationEvent(json, {
        source: "poll",
        bodyId: s,
        standardsRecordId: `std-${s}`,
        harmonizationClauseId: `clause-${s}`,
        syncedToStandardsRegistry: true,
      }).json;
    }
    json = pollIsoIecAiStandardsHarmonizationRegistry(json).json;
    json = recordEuAiOfficeAssessment(json, {
      notifiedBodyId: "nb-eu-test",
      notifiedBodyName: "EU NB Test",
      conformityStatus: "conformity",
      highRiskAiSystem: true,
      validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
    }).json;
    for (const g of ["cen_tc21", "cenelec_tc65x", "cen_cenelec_jtc21", "cenelec_clc_srg"] as const) {
      json = ingestCenCenelecGovernanceEvent(json, {
        source: "poll",
        bodyId: g,
        governanceRecordId: `gov-${g}`,
        productGovernanceClauseId: `clause-${g}`,
        syncedToGovernanceRegistry: true,
      }).json;
    }
    json = pollCenCenelecDigitalProductGovernanceRegistry(json).json;
    expect(evaluateIsoIecAiStandardsHarmonizationRegistryGate(json).passed).toBe(true);
    expect(evaluateCenCenelecDigitalProductGovernanceRegistryGate(json).passed).toBe(true);
  });
});

describe("AO5 multiverse branch merge seal CRDT", () => {
  it("branch merge seal after timeline seal", () => {
    process.env.THEME_EXPERIMENT_MULTIVERSE_BRANCH_MERGE_SEAL_CRDT = "1";
    process.env.THEME_EXPERIMENT_MULTIVERSE_TIMELINE_SEAL_CRDT = "1";
    process.env.THEME_EXPERIMENT_OMNIVERSE_EPOCH_FREEZE_CRDT = "1";
    process.env.THEME_EXPERIMENT_MULTIVERSE_CAUSALITY_LOCK_CRDT = "1";
    process.env.THEME_EXPERIMENT_METAVERSE_FINALITY_SEAL_CRDT = "1";
    process.env.THEME_EXPERIMENT_OMNIVERSE_EPOCH_SEAL_CRDT = "1";
    process.env.THEME_EXPERIMENT_MULTIVERSE_RECONCILIATION_CRDT = "1";
    process.env.THEME_EXPERIMENT_PARALLEL_UNIVERSE_MERGE_CRDT = "1";
    process.env.THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT = "1";
    process.env.THEME_EXPERIMENT_OMNIVERSE_CAUSAL_GRAPH_CRDT = "1";
    process.env.THEME_EXPERIMENT_MULTIVERSE_OUTCOME_CRDT = "1";
    const cosmic = buildCosmicWebJson();
    const mv = collapseMultiverseFromCosmicWeb(cosmic);
    const om = buildOmniverseFromMultiverse(mv.json);
    const cf = buildCounterfactualsFromOmniverse(om.json);
    const pu = mergeParallelUniversesFromCounterfactuals(cf.json);
    const rec = reconcileMultiverseFromParallelUniverses(pu.json);
    const epoch = sealOmniverseEpochFromReconciliation(rec.json);
    const finality = sealMetaverseFinalityFromEpoch(epoch.json);
    const locked = lockMultiverseCausalityFromFinality(finality.json);
    const frozen = freezeOmniverseEpochFromCausalityLock(locked.json);
    const timeline = sealMultiverseTimelineFromEpochFreeze(frozen.json);
    expect(evaluateMultiverseTimelineSealCrdtGate(timeline.json).passed).toBe(true);
    expect(evaluateMultiverseBranchMergeSealCrdtGate(sealMultiverseBranchMergeFromTimeline(timeline.json).json).passed).toBe(
      true,
    );
  });
});

describe("AO3 hypergraph L13 homotopy type-theoretic anchor", () => {
  it("HoTT anchor over L12 categorical quantum stack", () => {
    const l11Json = buildL13StackJson();
    expect(evaluateHypergraphL11TopologicalFaultTolerantAnchorGate(l11Json).passed).toBe(true);
    const l12 = categoricalQuantumAnchorL12FromL11Stack(l11Json);
    expect(evaluateHypergraphL12CategoricalQuantumAnchorGate(l12.json).passed).toBe(true);
    const l13 = homotopyTypeTheoreticAnchorL13FromL12Stack(l12.json);
    expect(l13.anchor?.anchored).toBe(true);
    expect(evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate(l13.json).passed).toBe(true);
  });
});

describe("AO4 premotor SMA planning publish", () => {
  it("commit_plan_publish after motor cortex execution", () => {
    process.env.THEME_EXPERIMENT_PREMOTOR_SMA_PLANNING_PUBLISH = "1";
    process.env.THEME_EXPERIMENT_MOTOR_CORTEX_EXECUTION_PUBLISH = "1";
    process.env.THEME_EXPERIMENT_CEREBELLUM_MOTOR_REFINEMENT_PUBLISH = "1";
    process.env.THEME_EXPERIMENT_BASAL_GANGLIA_ACTION_SELECTION_PUBLISH = "1";
    process.env.THEME_EXPERIMENT_THALAMUS_SENSORY_GATING_PUBLISH = "1";
    process.env.THEME_EXPERIMENT_MIDBRAIN_AROUSAL_PUBLISH_PACING = "1";
    process.env.THEME_EXPERIMENT_PONS_AUTONOMIC_BRIDGE_FAILOVER = "1";
    process.env.THEME_EXPERIMENT_MEDULLA_OBLONGATA_EMERGENCY_HALT = "1";
    process.env.THEME_EXPERIMENT_SPINAL_CORD_PUBLISH_THROTTLE = "1";

    const halted = recordMedullaEmergencyHalt({}, {
      reason: "spinal_throttle_breach",
      ethicsReviewId: null,
      spinalAttemptsInWindow: 3,
      rationale: "Spinal throttle breach",
      cleared: false,
    });
    const pons = syncPonsFromMedullaAndSpinal(halted.json);
    const mid = syncMidbrainFromPonsAndSpinal(pons.json);
    const thal = syncThalamusFromMidbrainAndSpinal(mid.json);
    const bg = syncBasalGangliaFromThalamusAndMidbrain(thal.json);
    const cb = syncCerebellumFromBasalGangliaAndMidbrain(bg.json);
    const mc = syncMotorCortexFromCerebellumAndMidbrain(cb.json);
    const pm = syncPremotorSmaFromMotorCortexAndEthics(mc.json);
    expect(pm.snap.planningMode).toBe("commit_plan_publish");
    expect(evaluateMotorCortexExecutionPublishGate(pm.json).passed).toBe(true);
    expect(evaluatePremotorSmaPlanningPublishGate(pm.json).passed).toBe(true);
  });
});
