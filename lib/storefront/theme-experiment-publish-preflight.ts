/**
 * Preflight publish gate collection for dashboard UI and E2E.
 */

import { evaluateStrictEnvGate } from "@/lib/experiment-production/strict-env-validator";
import { evaluateHypergraphZkDnaGate } from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { evaluateRecursiveZkDnaRollupGate } from "@/lib/compliance/recursive-zk-dna-rollup";
import { evaluateArcticQuantumMeshGate } from "@/lib/storefront/theme-experiment-arctic-quantum-mesh";
import { evaluateNistAiRmfLiveControlFeedGate } from "@/lib/compliance/nist-ai-rmf-live-control-feed";
import { evaluateOmniverseCausalGraphCrdtGate } from "@/lib/storefront/theme-experiment-omniverse-causal-graph-crdt";
import { evaluateHypergraphL4MetaAnchorGate } from "@/lib/compliance/hypergraph-l4-meta-anchor";
import { evaluateBrainstemAutonomicGuardGate } from "@/lib/storefront/theme-experiment-brainstem-autonomic-guard";
import { evaluateAntarcticSubglacialMeshGate } from "@/lib/storefront/theme-experiment-antarctic-subglacial-mesh";
import { evaluateEuAiActArt71PmmLiveGate } from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import { evaluateMultiverseCounterfactualCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";
import { evaluateHypergraphL5CompositionalAnchorGate } from "@/lib/compliance/hypergraph-l5-compositional-anchor";
import { evaluateSpinalCordPublishThrottleGate } from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import { evaluateLunarFarsideDtnMeshGate } from "@/lib/storefront/theme-experiment-lunar-farside-dtn-mesh";
import { evaluateUsFtcAiTransparencyLiveGate } from "@/lib/compliance/us-ftc-ai-transparency-live-feed";
import { evaluateParallelUniverseMergeCrdtGate } from "@/lib/storefront/theme-experiment-parallel-universe-merge-crdt";
import { evaluateHypergraphL6HolographicAnchorGate } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import { evaluateMedullaWithPonsPublishGate } from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import { evaluateMartianOrbitalDtnRelayGate } from "@/lib/storefront/theme-experiment-martian-orbital-dtn-relay";
import { evaluateOecdStateAgAiTransparencyMeshGate } from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import { evaluateMultiverseReconciliationCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-reconciliation-crdt";
import { evaluateHypergraphL7EntanglementAnchorGate } from "@/lib/compliance/hypergraph-l7-entanglement-anchor";
import { evaluatePonsAutonomicBridgeFailoverGate } from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import { evaluateJupiterTrojanDtnLagrangeGate } from "@/lib/storefront/theme-experiment-jupiter-trojan-dtn-lagrange";
import { evaluateUnAiOfficeGlobalRegistryMeshGate } from "@/lib/compliance/un-ai-office-global-registry-mesh";
import { evaluateOmniverseEpochSealCrdtGate } from "@/lib/storefront/theme-experiment-omniverse-epoch-seal-crdt";
import { evaluateHypergraphL8FaultTolerantAnchorGate } from "@/lib/compliance/hypergraph-l8-fault-tolerant-anchor";
import { evaluateMidbrainWithBasalGangliaAndThalamusPublishGate } from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";
import { evaluateMidbrainWithPremotorSmaMotorCortexCerebellumBasalGangliaAndThalamusPublishGate } from "@/lib/storefront/theme-experiment-premotor-sma-planning-publish";
import { evaluateNeptuneTritonRetrogradeDtnHaloGate } from "@/lib/storefront/theme-experiment-neptune-triton-retrograde-dtn-halo";
import { evaluateItuUncitralDigitalCommerceAiRegistryGate } from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";
import { evaluateOmniverseEpochFreezeCrdtGate } from "@/lib/storefront/theme-experiment-omniverse-epoch-freeze-crdt";
import { evaluateHypergraphL11TopologicalFaultTolerantAnchorGate } from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";
import { evaluatePlutoCharonBinaryDtnBarycenterGate } from "@/lib/storefront/theme-experiment-pluto-charon-binary-dtn-barycenter";
import { evaluateIsoIecAiStandardsHarmonizationRegistryGate } from "@/lib/compliance/iso-iec-ai-standards-harmonization-registry";
import { evaluateMultiverseTimelineSealCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-timeline-seal-crdt";
import { evaluateHypergraphL12CategoricalQuantumAnchorGate } from "@/lib/compliance/hypergraph-l12-categorical-quantum-anchor";
import { evaluateKuiperScatteredDiskDtnAphelionGate } from "@/lib/storefront/theme-experiment-kuiper-scattered-disk-dtn-aphelion";
import { evaluateCenCenelecDigitalProductGovernanceRegistryGate } from "@/lib/compliance/cen-cenelec-digital-product-governance-registry";
import { evaluateMultiverseBranchMergeSealCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-branch-merge-seal-crdt";
import { evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate } from "@/lib/compliance/hypergraph-l13-homotopy-type-theoretic-anchor";
import { evaluateUranusObliquityDtnPolarRelayGate } from "@/lib/storefront/theme-experiment-uranus-obliquity-dtn-polar-relay";
import { evaluateWtoUpuCrossBorderAiTradeRegistryGate } from "@/lib/compliance/wto-upu-cross-border-ai-trade-registry";
import { evaluateMultiverseCausalityLockCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-causality-lock-crdt";
import { evaluateHypergraphL10QuantumResilientAnchorGate } from "@/lib/compliance/hypergraph-l10-quantum-resilient-anchor";
import { evaluateSaturnRingDtnShepherdGate } from "@/lib/storefront/theme-experiment-saturn-ring-dtn-shepherd";
import { evaluateIcaoImoAiAviationRegistryGate } from "@/lib/compliance/icao-imo-ai-aviation-registry";
import { evaluateMetaverseFinalitySealCrdtGate } from "@/lib/storefront/theme-experiment-metaverse-finality-seal-crdt";
import { evaluateHypergraphL9ByzantineAnchorGate } from "@/lib/compliance/hypergraph-l9-byzantine-anchor";
import { evaluatePrefrontalEthicsBoardGate } from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { evaluateCerebellarMotorOrganoidGate } from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";

export type PublishGateFailure = {
  code: string;
  headline: string;
  detail: string;
};

export function collectExperimentPublishGateFailures(themeExperimentJson: unknown): PublishGateFailure[] {
  const failures: PublishGateFailure[] = [];

  const checks: { code: string; result: { passed: boolean; headline: string; detail: string } }[] = [
    { code: "strict_env", result: evaluateStrictEnvGate() },
    { code: "recursive_zk", result: evaluateRecursiveZkDnaRollupGate(themeExperimentJson) },
    { code: "hypergraph_zk", result: evaluateHypergraphZkDnaGate(themeExperimentJson) },
    { code: "ethics_board", result: evaluatePrefrontalEthicsBoardGate(themeExperimentJson) },
    { code: "cerebellar", result: evaluateCerebellarMotorOrganoidGate(themeExperimentJson) },
    { code: "arctic_quantum", result: evaluateArcticQuantumMeshGate(themeExperimentJson) },
    { code: "nist_rmf_live", result: evaluateNistAiRmfLiveControlFeedGate(themeExperimentJson) },
    { code: "multiverse", result: evaluateOmniverseCausalGraphCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l4", result: evaluateHypergraphL4MetaAnchorGate(themeExperimentJson) },
    { code: "brainstem", result: evaluateBrainstemAutonomicGuardGate(themeExperimentJson) },
    { code: "subglacial", result: evaluateAntarcticSubglacialMeshGate(themeExperimentJson) },
    { code: "eu_art71_pmm", result: evaluateEuAiActArt71PmmLiveGate(themeExperimentJson) },
    { code: "counterfactual", result: evaluateMultiverseCounterfactualCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l5", result: evaluateHypergraphL5CompositionalAnchorGate(themeExperimentJson) },
    { code: "spinal_throttle", result: evaluateMidbrainWithPremotorSmaMotorCortexCerebellumBasalGangliaAndThalamusPublishGate(themeExperimentJson) },
    { code: "lunar_farside", result: evaluateLunarFarsideDtnMeshGate(themeExperimentJson) },
    { code: "us_ftc_live", result: evaluateUsFtcAiTransparencyLiveGate(themeExperimentJson) },
    { code: "parallel_universe", result: evaluateParallelUniverseMergeCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l6", result: evaluateHypergraphL6HolographicAnchorGate(themeExperimentJson) },
    { code: "medulla_halt", result: evaluateMedullaWithPonsPublishGate(themeExperimentJson) },
    { code: "martian_orbital", result: evaluateMartianOrbitalDtnRelayGate(themeExperimentJson) },
    { code: "oecd_mesh", result: evaluateOecdStateAgAiTransparencyMeshGate(themeExperimentJson) },
    { code: "multiverse_reconciliation", result: evaluateMultiverseReconciliationCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l7", result: evaluateHypergraphL7EntanglementAnchorGate(themeExperimentJson) },
    { code: "pons_bridge", result: evaluatePonsAutonomicBridgeFailoverGate(themeExperimentJson) },
    { code: "jupiter_trojan", result: evaluateJupiterTrojanDtnLagrangeGate(themeExperimentJson) },
    { code: "un_registry", result: evaluateUnAiOfficeGlobalRegistryMeshGate(themeExperimentJson) },
    { code: "omniverse_epoch", result: evaluateOmniverseEpochSealCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l8", result: evaluateHypergraphL8FaultTolerantAnchorGate(themeExperimentJson) },
    { code: "basal_ganglia", result: evaluateMidbrainWithBasalGangliaAndThalamusPublishGate(themeExperimentJson) },
    { code: "saturn_ring", result: evaluateSaturnRingDtnShepherdGate(themeExperimentJson) },
    { code: "aviation_registry", result: evaluateIcaoImoAiAviationRegistryGate(themeExperimentJson) },
    { code: "metaverse_finality", result: evaluateMetaverseFinalitySealCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l9", result: evaluateHypergraphL9ByzantineAnchorGate(themeExperimentJson) },
    { code: "uranus_polar", result: evaluateUranusObliquityDtnPolarRelayGate(themeExperimentJson) },
    { code: "trade_registry", result: evaluateWtoUpuCrossBorderAiTradeRegistryGate(themeExperimentJson) },
    { code: "causality_lock", result: evaluateMultiverseCausalityLockCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l10", result: evaluateHypergraphL10QuantumResilientAnchorGate(themeExperimentJson) },
    { code: "neptune_halo", result: evaluateNeptuneTritonRetrogradeDtnHaloGate(themeExperimentJson) },
    { code: "commerce_registry", result: evaluateItuUncitralDigitalCommerceAiRegistryGate(themeExperimentJson) },
    { code: "epoch_freeze", result: evaluateOmniverseEpochFreezeCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l11", result: evaluateHypergraphL11TopologicalFaultTolerantAnchorGate(themeExperimentJson) },
    { code: "pluto_barycenter", result: evaluatePlutoCharonBinaryDtnBarycenterGate(themeExperimentJson) },
    { code: "standards_registry", result: evaluateIsoIecAiStandardsHarmonizationRegistryGate(themeExperimentJson) },
    { code: "timeline_seal", result: evaluateMultiverseTimelineSealCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l12", result: evaluateHypergraphL12CategoricalQuantumAnchorGate(themeExperimentJson) },
    { code: "kuiper_aphelion", result: evaluateKuiperScatteredDiskDtnAphelionGate(themeExperimentJson) },
    { code: "governance_registry", result: evaluateCenCenelecDigitalProductGovernanceRegistryGate(themeExperimentJson) },
    { code: "branch_merge_seal", result: evaluateMultiverseBranchMergeSealCrdtGate(themeExperimentJson) },
    { code: "hypergraph_l13", result: evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate(themeExperimentJson) },
  ];

  for (const c of checks) {
    if (!c.result.passed) {
      failures.push({
        code: c.code,
        headline: c.result.headline,
        detail: c.result.detail,
      });
    }
  }

  return failures;
}

export function experimentPublishPreflightBlocked(themeExperimentJson: unknown): boolean {
  return collectExperimentPublishGateFailures(themeExperimentJson).length > 0;
}
