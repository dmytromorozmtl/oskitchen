import {
  isBayesianBqOnlyMode,
  isBayesianDecisionEnabled,
  resolveBayesianExperimentDecision,
} from "@/lib/storefront/theme-experiment-bayesian";
import {
  applyCupedToArmMetrics,
  isCupedDecisionEnabled,
} from "@/lib/storefront/theme-experiment-cuped";
import { evaluateCausalForestPublishGate } from "@/lib/storefront/theme-experiment-causal-forest";
import { evaluateSpilloverPublishGate } from "@/lib/storefront/theme-experiment-causal-dag";
import { evaluateInterferencePublishGate } from "@/lib/storefront/theme-experiment-interference-matrix";
import { evaluateFederatedLearningPublishGate } from "@/lib/storefront/theme-experiment-federated-learning";
import { evaluateCompositionalPublishGate } from "@/lib/storefront/theme-experiment-compositional-ui";
import { evaluateQuantumSafePublishGate } from "@/lib/storefront/theme-experiment-quantum-safe";
import { evaluateHoldoutWsGate } from "@/lib/storefront/theme-experiment-holdout-ws";
import { evaluateAutonomousScientistGate } from "@/lib/storefront/theme-experiment-autonomous-scientist";
import { evaluateEuAiActPublishGate } from "@/lib/compliance/eu-ai-act";
import { evaluateHomomorphicMetricsPublishGate } from "@/lib/storefront/theme-experiment-homomorphic-metrics";
import { evaluateQuboBanditGate } from "@/lib/storefront/theme-experiment-qubo-bandit";
import { evaluateCausalDiscoveryAgentGate } from "@/lib/storefront/theme-experiment-causal-discovery-agent";
import { evaluateUkAiSafetyPublishGate } from "@/lib/compliance/uk-ai-safety";
import { evaluateZkAssignmentFairnessGate } from "@/lib/storefront/theme-experiment-zk-assignment-fairness";
import { evaluateNeuromorphicAssignGate } from "@/lib/storefront/theme-experiment-neuromorphic-assign";
import { evaluateMultiAgentOrchestratorGate } from "@/lib/storefront/theme-experiment-multi-agent-orchestrator";
import { evaluateEo14110InventoryPublishGate } from "@/lib/compliance/eo-14110-ai-inventory";
import { evaluateTeeAttestationPublishGate } from "@/lib/storefront/theme-experiment-tee-assign";
import { evaluatePhotonicAssignGate } from "@/lib/storefront/theme-experiment-photonic-assign";
import { evaluateGlobalMeshPublishGate } from "@/lib/storefront/theme-experiment-global-mesh";
import { evaluateNistAiRmfPublishGate } from "@/lib/compliance/nist-ai-rmf";
import { evaluateDnaAuditTrailGate } from "@/lib/compliance/dna-encoded-audit-trail";
import { evaluateBioNeuronAssignGate } from "@/lib/storefront/theme-experiment-bio-neuron-assign";
import { evaluateDtnMeshPublishGate } from "@/lib/storefront/theme-experiment-dtn-mesh";
import { evaluateIsmapNzismPublishGate } from "@/lib/compliance/ismap-nzism-crosswalk";
import { evaluateIso42001AiMsPublishGate } from "@/lib/compliance/iso-42001-ai-ms";
import { evaluatePqcDnaArchivalGate } from "@/lib/compliance/pqc-dna-archival";
import { evaluateWetwareCalibrationGate } from "@/lib/storefront/theme-experiment-wetware-calibration";
import { evaluateCislunarDtnPublishGate } from "@/lib/storefront/theme-experiment-cislunar-dtn";
import { evaluatePspfNzDtaPublishGate } from "@/lib/compliance/pspf-nz-dta-crosswalk";
import { evaluateIso42001Stage2PublishGate } from "@/lib/compliance/iso-42001-stage2";
import { evaluateHomomorphicDnaFederationGate } from "@/lib/compliance/homomorphic-dna-federation";
import { evaluateOrganoidWetwareGate } from "@/lib/storefront/theme-experiment-organoid-wetware";
import { evaluateHeliopauseDtnPublishGate } from "@/lib/storefront/theme-experiment-heliopause-dtn";
import { evaluateSociNzGcdoPublishGate } from "@/lib/compliance/soci-nz-gcdo-crosswalk";
import { evaluateIso42001CertBodyPublishGate } from "@/lib/compliance/iso-42001-cert-body";
import { evaluateZkDnaRollupGate } from "@/lib/compliance/zk-dna-rollup";
import { evaluateCorticalOrganoidMeshGate } from "@/lib/storefront/theme-experiment-cortical-organoid-mesh";
import { evaluateGalacticMeshPublishGate } from "@/lib/storefront/theme-experiment-galactic-mesh";
import { evaluateFiveEyesCloudCompactGate } from "@/lib/compliance/five-eyes-cloud-compact";
import { evaluateEuAiOfficeNotifiedBodyGate } from "@/lib/compliance/eu-ai-office-notified-body";
import { evaluateRecursiveZkDnaRollupGate } from "@/lib/compliance/recursive-zk-dna-rollup";
import { evaluateHippocampalOrganoidMeshGate } from "@/lib/storefront/theme-experiment-hippocampal-organoid-mesh";
import { evaluateIntergalacticMeshFederationGate } from "@/lib/storefront/theme-experiment-intergalactic-mesh-federation";
import { evaluateFiveEyesPlusCompactGate } from "@/lib/compliance/five-eyes-plus-compact";
import { evaluateEuAiOfficeContinuousConformityGate } from "@/lib/compliance/eu-ai-office-continuous-conformity";
import { evaluateProductionHardeningGate } from "@/lib/experiment-production/production-hardening-gate";
import { evaluateStrictEnvGate } from "@/lib/experiment-production/strict-env-validator";
import { evaluateHypergraphZkDnaGate } from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { evaluatePrefrontalOrganoidMeshGate } from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";
import { evaluateIndoPacificCompactGate } from "@/lib/compliance/indo-pacific-compact";
import { evaluateEuAiActLiveRegistryGate } from "@/lib/compliance/eu-ai-act-live-registry";
import { evaluateCosmicWebFederationGate } from "@/lib/storefront/theme-experiment-cosmic-web-federation";
import { evaluateHypergraphEvolutionGate } from "@/lib/compliance/hypergraph-evolution";
import { evaluatePrefrontalEthicsBoardGate } from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { evaluatePanPacificQuantumMeshGate } from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";
import { evaluateUkDsitAlgorithmicTransparencyGate } from "@/lib/compliance/uk-dsit-algorithmic-transparency";
import { evaluateMultiverseOutcomeCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";
import { evaluateHypergraphL3RecursiveAnchorGate } from "@/lib/compliance/hypergraph-l3-recursive-anchor";
import { evaluateCerebellarMotorOrganoidGate } from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";
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
import { evaluateMedullaOblongataEmergencyHaltGate } from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";
import { evaluateMartianOrbitalDtnRelayGate } from "@/lib/storefront/theme-experiment-martian-orbital-dtn-relay";
import { evaluateOecdStateAgAiTransparencyMeshGate } from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import { evaluateMultiverseReconciliationCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-reconciliation-crdt";
import { evaluateHypergraphL7EntanglementAnchorGate } from "@/lib/compliance/hypergraph-l7-entanglement-anchor";
import { evaluatePonsAutonomicBridgeFailoverGate } from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import { evaluateJupiterTrojanDtnLagrangeGate } from "@/lib/storefront/theme-experiment-jupiter-trojan-dtn-lagrange";
import { evaluateUnAiOfficeGlobalRegistryMeshGate } from "@/lib/compliance/un-ai-office-global-registry-mesh";
import { evaluateOmniverseEpochSealCrdtGate } from "@/lib/storefront/theme-experiment-omniverse-epoch-seal-crdt";
import { evaluateHypergraphL8FaultTolerantAnchorGate } from "@/lib/compliance/hypergraph-l8-fault-tolerant-anchor";
import { evaluateMidbrainArousalPublishPacingGate } from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import { evaluateSaturnRingDtnShepherdGate } from "@/lib/storefront/theme-experiment-saturn-ring-dtn-shepherd";
import { evaluateIcaoImoAiAviationRegistryGate } from "@/lib/compliance/icao-imo-ai-aviation-registry";
import { evaluateMetaverseFinalitySealCrdtGate } from "@/lib/storefront/theme-experiment-metaverse-finality-seal-crdt";
import { evaluateHypergraphL9ByzantineAnchorGate } from "@/lib/compliance/hypergraph-l9-byzantine-anchor";
import { evaluateThalamusSensoryGatingPublishGate } from "@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish";
import { evaluateUranusObliquityDtnPolarRelayGate } from "@/lib/storefront/theme-experiment-uranus-obliquity-dtn-polar-relay";
import { evaluateWtoUpuCrossBorderAiTradeRegistryGate } from "@/lib/compliance/wto-upu-cross-border-ai-trade-registry";
import { evaluateMultiverseCausalityLockCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-causality-lock-crdt";
import { evaluateHypergraphL10QuantumResilientAnchorGate } from "@/lib/compliance/hypergraph-l10-quantum-resilient-anchor";
import { evaluateBasalGangliaActionSelectionPublishGate } from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";
import { evaluateNeptuneTritonRetrogradeDtnHaloGate } from "@/lib/storefront/theme-experiment-neptune-triton-retrograde-dtn-halo";
import { evaluateItuUncitralDigitalCommerceAiRegistryGate } from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";
import { evaluateOmniverseEpochFreezeCrdtGate } from "@/lib/storefront/theme-experiment-omniverse-epoch-freeze-crdt";
import { evaluateHypergraphL11TopologicalFaultTolerantAnchorGate } from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";
import { evaluateCerebellumMotorRefinementPublishGate } from "@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish";
import { evaluatePlutoCharonBinaryDtnBarycenterGate } from "@/lib/storefront/theme-experiment-pluto-charon-binary-dtn-barycenter";
import { evaluateIsoIecAiStandardsHarmonizationRegistryGate } from "@/lib/compliance/iso-iec-ai-standards-harmonization-registry";
import { evaluateHypergraphL12CategoricalQuantumAnchorGate } from "@/lib/compliance/hypergraph-l12-categorical-quantum-anchor";
import { evaluateMotorCortexExecutionPublishGate } from "@/lib/storefront/theme-experiment-motor-cortex-execution-publish";
import { evaluateMultiverseTimelineSealCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-timeline-seal-crdt";
import { evaluateKuiperScatteredDiskDtnAphelionGate } from "@/lib/storefront/theme-experiment-kuiper-scattered-disk-dtn-aphelion";
import { evaluateCenCenelecDigitalProductGovernanceRegistryGate } from "@/lib/compliance/cen-cenelec-digital-product-governance-registry";
import { evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate } from "@/lib/compliance/hypergraph-l13-homotopy-type-theoretic-anchor";
import { evaluatePremotorSmaPlanningPublishGate } from "@/lib/storefront/theme-experiment-premotor-sma-planning-publish";
import { evaluateMultiverseBranchMergeSealCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-branch-merge-seal-crdt";
import { evaluateGeoCausalLift, readGeoMarkets } from "@/lib/storefront/theme-experiment-geo-causal";
import {
  defaultMaxLooks,
  evaluateSequentialDecision,
} from "@/lib/storefront/theme-experiment-sequential";
import {
  experimentLiftPercentPoints,
  twoProportionSignificance,
} from "@/lib/storefront/theme-experiment-significance";
import type { ExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

export type ExperimentProdDecision = {
  recommendation: "publish_draft" | "keep_published" | "insufficient_data" | "inconclusive";
  headline: string;
  detail: string;
  liftPp: number;
  revenueLiftPp: number;
  significant: boolean;
  sampleSizeOk: boolean;
  publishedRate: number;
  draftRate: number;
  sequentialPassed: boolean;
  guardrailsOk: boolean;
  bayesianPassed: boolean;
  bayesianProbLift?: number;
  geoAdjustedLiftPp?: number;
  causalForestPassed?: boolean;
  spilloverPassed?: boolean;
  interferencePassed?: boolean;
  federatedLearningPassed?: boolean;
  compositionalPassed?: boolean;
  quantumSafePassed?: boolean;
  holdoutWsPassed?: boolean;
  autonomousScientistPassed?: boolean;
  euAiActPassed?: boolean;
  homomorphicMetricsPassed?: boolean;
  quboBanditPassed?: boolean;
  causalDiscoveryPassed?: boolean;
  ukAiSafetyPassed?: boolean;
  zkAssignmentFairnessPassed?: boolean;
  neuromorphicAssignPassed?: boolean;
  multiAgentOrchestratorPassed?: boolean;
  eo14110InventoryPassed?: boolean;
  teeAttestationPassed?: boolean;
  photonicAssignPassed?: boolean;
  globalMeshPassed?: boolean;
  nistAiRmfPassed?: boolean;
  dnaAuditTrailPassed?: boolean;
  bioNeuronAssignPassed?: boolean;
  dtnMeshPassed?: boolean;
  ismapNzismPassed?: boolean;
  iso42001AiMsPassed?: boolean;
  pqcDnaArchivalPassed?: boolean;
  wetwareCalibrationPassed?: boolean;
  cislunarDtnPassed?: boolean;
  pspfNzDtaPassed?: boolean;
  iso42001Stage2Passed?: boolean;
  homomorphicDnaFederationPassed?: boolean;
  organoidWetwarePassed?: boolean;
  heliopauseDtnPassed?: boolean;
  sociNzGcdoPassed?: boolean;
  iso42001CertBodyPassed?: boolean;
  zkDnaRollupPassed?: boolean;
  corticalOrganoidMeshPassed?: boolean;
  galacticMeshPassed?: boolean;
  fiveEyesCloudCompactPassed?: boolean;
  euAiOfficeNotifiedBodyPassed?: boolean;
  recursiveZkDnaRollupPassed?: boolean;
  hippocampalOrganoidMeshPassed?: boolean;
  intergalacticMeshFederationPassed?: boolean;
  fiveEyesPlusCompactPassed?: boolean;
  euAiOfficeContinuousConformityPassed?: boolean;
  productionHardeningPassed?: boolean;
  strictEnvPassed?: boolean;
  hypergraphZkDnaPassed?: boolean;
  prefrontalOrganoidMeshPassed?: boolean;
  indoPacificCompactPassed?: boolean;
  euAiActLiveRegistryPassed?: boolean;
  cosmicWebFederationPassed?: boolean;
  hypergraphEvolutionPassed?: boolean;
  prefrontalEthicsBoardPassed?: boolean;
  panPacificQuantumMeshPassed?: boolean;
  ukDsitAlgorithmicTransparencyPassed?: boolean;
  multiverseOutcomeCrdtPassed?: boolean;
  hypergraphL3RecursiveAnchorPassed?: boolean;
  cerebellarMotorOrganoidPassed?: boolean;
  arcticQuantumMeshPassed?: boolean;
  nistAiRmfLiveControlFeedPassed?: boolean;
  omniverseCausalGraphCrdtPassed?: boolean;
  hypergraphL4MetaAnchorPassed?: boolean;
  brainstemAutonomicGuardPassed?: boolean;
  antarcticSubglacialMeshPassed?: boolean;
  euAiActArt71PmmLivePassed?: boolean;
  multiverseCounterfactualCrdtPassed?: boolean;
  hypergraphL5CompositionalAnchorPassed?: boolean;
  spinalCordPublishThrottlePassed?: boolean;
  lunarFarsideDtnMeshPassed?: boolean;
  usFtcAiTransparencyLivePassed?: boolean;
  parallelUniverseMergeCrdtPassed?: boolean;
  hypergraphL6HolographicAnchorPassed?: boolean;
  medullaOblongataEmergencyHaltPassed?: boolean;
  martianOrbitalDtnRelayPassed?: boolean;
  oecdStateAgAiTransparencyMeshPassed?: boolean;
  multiverseReconciliationCrdtPassed?: boolean;
  hypergraphL7EntanglementAnchorPassed?: boolean;
  ponsAutonomicBridgeFailoverPassed?: boolean;
  jupiterTrojanDtnLagrangePassed?: boolean;
  unAiOfficeGlobalRegistryMeshPassed?: boolean;
  omniverseEpochSealCrdtPassed?: boolean;
  hypergraphL8FaultTolerantAnchorPassed?: boolean;
  midbrainArousalPublishPacingPassed?: boolean;
  saturnRingDtnShepherdPassed?: boolean;
  icaoImoAiAviationRegistryPassed?: boolean;
  metaverseFinalitySealCrdtPassed?: boolean;
  hypergraphL9ByzantineAnchorPassed?: boolean;
  thalamusSensoryGatingPublishPassed?: boolean;
  uranusObliquityDtnPolarRelayPassed?: boolean;
  wtoUpuCrossBorderAiTradeRegistryPassed?: boolean;
  multiverseCausalityLockCrdtPassed?: boolean;
  hypergraphL10QuantumResilientAnchorPassed?: boolean;
  basalGangliaActionSelectionPublishPassed?: boolean;
  neptuneTritonRetrogradeDtnHaloPassed?: boolean;
  ituUncitralDigitalCommerceAiRegistryPassed?: boolean;
  omniverseEpochFreezeCrdtPassed?: boolean;
  hypergraphL11TopologicalFaultTolerantAnchorPassed?: boolean;
  cerebellumMotorRefinementPublishPassed?: boolean;
  plutoCharonBinaryDtnBarycenterPassed?: boolean;
  isoIecAiStandardsHarmonizationRegistryPassed?: boolean;
  hypergraphL12CategoricalQuantumAnchorPassed?: boolean;
  motorCortexExecutionPublishPassed?: boolean;
  multiverseTimelineSealCrdtPassed?: boolean;
  kuiperScatteredDiskDtnAphelionPassed?: boolean;
  cenCenelecDigitalProductGovernanceRegistryPassed?: boolean;
  hypergraphL13HomotopyTypeTheoreticAnchorPassed?: boolean;
  premotorSmaPlanningPublishPassed?: boolean;
  multiverseBranchMergeSealCrdtPassed?: boolean;
};

export type ExperimentDecisionThresholds = {
  minCheckoutsPerArm: number;
  minLiftPp: number;
  alpha: number;
};

export const DEFAULT_EXPERIMENT_DECISION_THRESHOLDS: ExperimentDecisionThresholds = {
  minCheckoutsPerArm: 100,
  minLiftPp: 2,
  alpha: 0.05,
};

function revenueProxyLiftPp(rows: ExperimentArmMetrics[]): number {
  const proxyCents = Number(process.env.EXPERIMENT_REVENUE_PROXY_CENTS ?? "4500");
  const published = rows.find((r) => r.arm === "published");
  const draft = rows.find((r) => r.arm === "draft");
  if (!published || !draft) return 0;
  const pubRev = published.conversions * proxyCents;
  const draftRev = draft.conversions * proxyCents;
  const pubRate = published.checkouts > 0 ? (pubRev / published.checkouts / proxyCents) * 100 : 0;
  const draftRate = draft.checkouts > 0 ? (draftRev / draft.checkouts / proxyCents) * 100 : 0;
  return experimentLiftPercentPoints(pubRate, draftRate);
}

function multiMetricGuardrailsOk(liftPp: number, revenueLiftPp: number, minLiftPp: number): boolean {
  if (process.env.THEME_EXPERIMENT_MULTI_METRIC_GUARDRAILS !== "1") return true;
  return liftPp >= minLiftPp && revenueLiftPp >= minLiftPp * 0.5;
}

/**
 * Production decision helper (Experiment v2): when to publish draft theme vs keep published.
 */
export function evaluateExperimentProdDecision(
  rows: ExperimentArmMetrics[],
  thresholds: ExperimentDecisionThresholds = DEFAULT_EXPERIMENT_DECISION_THRESHOLDS,
  options?: { themeExperimentJson?: unknown; lookIndex?: number },
): ExperimentProdDecision {
  const metrics = isCupedDecisionEnabled()
    ? applyCupedToArmMetrics(rows, options?.themeExperimentJson)
    : rows;
  const published = metrics.find((r) => r.arm === "published");
  const draft = metrics.find((r) => r.arm === "draft");

  if (!published || !draft) {
    return {
      recommendation: "insufficient_data",
      headline: "Not enough data",
      detail: "Need both published and draft arm metrics.",
      liftPp: 0,
      revenueLiftPp: 0,
      significant: false,
      sampleSizeOk: false,
      publishedRate: 0,
      draftRate: 0,
      sequentialPassed: true,
      guardrailsOk: false,
      bayesianPassed: false,
    };
  }

  const publishedRate = published.conversionRatePercent;
  const draftRate = draft.conversionRatePercent;
  const liftPp = experimentLiftPercentPoints(publishedRate, draftRate);
  const revenueLiftPp = revenueProxyLiftPp(metrics);
  const sig = twoProportionSignificance({
    published: { successes: published.conversions, trials: published.checkouts },
    draft: { successes: draft.conversions, trials: draft.checkouts },
    minPerArm: thresholds.minCheckoutsPerArm,
    alpha: thresholds.alpha,
  });

  const sequential = evaluateSequentialDecision({
    zStat: sig.z,
    lookIndex: options?.lookIndex ?? 1,
    maxLooks: defaultMaxLooks(),
    alpha: thresholds.alpha,
  });

  const guardrailsOk = multiMetricGuardrailsOk(liftPp, revenueLiftPp, thresholds.minLiftPp);

  const bayesian = resolveBayesianExperimentDecision({
    arms: metrics.map((m) => ({
      armId: String(m.arm),
      conversions: m.conversions,
      checkouts: m.checkouts,
    })),
    thresholdPp: thresholds.minLiftPp,
    themeExperimentJson: options?.themeExperimentJson,
  });
  const geo = evaluateGeoCausalLift(readGeoMarkets(options?.themeExperimentJson));
  const causal = evaluateCausalForestPublishGate({
    themeExperimentJson: options?.themeExperimentJson,
    globalLiftPp: liftPp,
  });
  const spillover = evaluateSpilloverPublishGate(options?.themeExperimentJson);
  const interference = evaluateInterferencePublishGate(options?.themeExperimentJson);
  const federated = evaluateFederatedLearningPublishGate(options?.themeExperimentJson);
  const compositional = evaluateCompositionalPublishGate(options?.themeExperimentJson);
  const quantumSafe = evaluateQuantumSafePublishGate(options?.themeExperimentJson);
  const holdoutWs = evaluateHoldoutWsGate(options?.themeExperimentJson);
  const scientist = evaluateAutonomousScientistGate(options?.themeExperimentJson);
  const euAiAct = evaluateEuAiActPublishGate(options?.themeExperimentJson);
  const homomorphic = evaluateHomomorphicMetricsPublishGate(options?.themeExperimentJson);
  const qubo = evaluateQuboBanditGate(options?.themeExperimentJson);
  const discovery = evaluateCausalDiscoveryAgentGate(options?.themeExperimentJson);
  const ukAi = evaluateUkAiSafetyPublishGate(options?.themeExperimentJson);
  const zkFairness = evaluateZkAssignmentFairnessGate(options?.themeExperimentJson);
  const neuromorphic = evaluateNeuromorphicAssignGate(options?.themeExperimentJson);
  const orchestrator = evaluateMultiAgentOrchestratorGate(options?.themeExperimentJson);
  const eo14110 = evaluateEo14110InventoryPublishGate(options?.themeExperimentJson);
  const tee = evaluateTeeAttestationPublishGate(options?.themeExperimentJson);
  const photonic = evaluatePhotonicAssignGate(options?.themeExperimentJson);
  const globalMesh = evaluateGlobalMeshPublishGate(options?.themeExperimentJson);
  const nistRmf = evaluateNistAiRmfPublishGate(options?.themeExperimentJson);
  const dnaTrail = evaluateDnaAuditTrailGate(options?.themeExperimentJson);
  const bioNeuron = evaluateBioNeuronAssignGate(options?.themeExperimentJson);
  const dtnMesh = evaluateDtnMeshPublishGate(options?.themeExperimentJson);
  const ismapNzism = evaluateIsmapNzismPublishGate(options?.themeExperimentJson);
  const iso42001 = evaluateIso42001AiMsPublishGate(options?.themeExperimentJson);
  const pqcDna = evaluatePqcDnaArchivalGate(options?.themeExperimentJson);
  const wetware = evaluateWetwareCalibrationGate(options?.themeExperimentJson);
  const cislunar = evaluateCislunarDtnPublishGate(options?.themeExperimentJson);
  const pspfNz = evaluatePspfNzDtaPublishGate(options?.themeExperimentJson);
  const iso42001Stage2 = evaluateIso42001Stage2PublishGate(options?.themeExperimentJson);
  const homDnaFed = evaluateHomomorphicDnaFederationGate(options?.themeExperimentJson);
  const organoid = evaluateOrganoidWetwareGate(options?.themeExperimentJson);
  const heliopause = evaluateHeliopauseDtnPublishGate(options?.themeExperimentJson);
  const sociGcdo = evaluateSociNzGcdoPublishGate(options?.themeExperimentJson);
  const certBody = evaluateIso42001CertBodyPublishGate(options?.themeExperimentJson);
  const zkDnaRollup = evaluateZkDnaRollupGate(options?.themeExperimentJson);
  const corticalMesh = evaluateCorticalOrganoidMeshGate(options?.themeExperimentJson);
  const galacticMesh = evaluateGalacticMeshPublishGate(options?.themeExperimentJson);
  const fiveEyes = evaluateFiveEyesCloudCompactGate(options?.themeExperimentJson);
  const euAiOffice = evaluateEuAiOfficeNotifiedBodyGate(options?.themeExperimentJson);
  const recursiveZk = evaluateRecursiveZkDnaRollupGate(options?.themeExperimentJson);
  const hippocampal = evaluateHippocampalOrganoidMeshGate(options?.themeExperimentJson);
  const intergalactic = evaluateIntergalacticMeshFederationGate(options?.themeExperimentJson);
  const fiveEyesPlus = evaluateFiveEyesPlusCompactGate(options?.themeExperimentJson);
  const euContinuous = evaluateEuAiOfficeContinuousConformityGate(options?.themeExperimentJson);
  const prodHardening = evaluateProductionHardeningGate(options?.themeExperimentJson);
  const strictEnv = evaluateStrictEnvGate();
  const hypergraphZk = evaluateHypergraphZkDnaGate(options?.themeExperimentJson);
  const prefrontal = evaluatePrefrontalOrganoidMeshGate(options?.themeExperimentJson);
  const indoPacific = evaluateIndoPacificCompactGate(options?.themeExperimentJson);
  const euLiveRegistry = evaluateEuAiActLiveRegistryGate(options?.themeExperimentJson);
  const cosmicWeb = evaluateCosmicWebFederationGate(options?.themeExperimentJson);
  const hypergraphEvolution = evaluateHypergraphEvolutionGate(options?.themeExperimentJson);
  const ethicsBoard = evaluatePrefrontalEthicsBoardGate(options?.themeExperimentJson);
  const panPacific = evaluatePanPacificQuantumMeshGate(options?.themeExperimentJson);
  const ukDsit = evaluateUkDsitAlgorithmicTransparencyGate(options?.themeExperimentJson);
  const multiverse = evaluateMultiverseOutcomeCrdtGate(options?.themeExperimentJson);
  const hypergraphL3 = evaluateHypergraphL3RecursiveAnchorGate(options?.themeExperimentJson);
  const cerebellar = evaluateCerebellarMotorOrganoidGate(options?.themeExperimentJson);
  const arcticQuantum = evaluateArcticQuantumMeshGate(options?.themeExperimentJson);
  const nistRmfLive = evaluateNistAiRmfLiveControlFeedGate(options?.themeExperimentJson);
  const omniverseCausal = evaluateOmniverseCausalGraphCrdtGate(options?.themeExperimentJson);
  const hypergraphL4 = evaluateHypergraphL4MetaAnchorGate(options?.themeExperimentJson);
  const brainstemAutonomic = evaluateBrainstemAutonomicGuardGate(options?.themeExperimentJson);
  const antarcticSubglacial = evaluateAntarcticSubglacialMeshGate(options?.themeExperimentJson);
  const euArt71Pmm = evaluateEuAiActArt71PmmLiveGate(options?.themeExperimentJson);
  const counterfactualCrdt = evaluateMultiverseCounterfactualCrdtGate(options?.themeExperimentJson);
  const hypergraphL5 = evaluateHypergraphL5CompositionalAnchorGate(options?.themeExperimentJson);
  const spinalThrottle = evaluateSpinalCordPublishThrottleGate(options?.themeExperimentJson);
  const lunarFarside = evaluateLunarFarsideDtnMeshGate(options?.themeExperimentJson);
  const usFtcLive = evaluateUsFtcAiTransparencyLiveGate(options?.themeExperimentJson);
  const parallelUniverse = evaluateParallelUniverseMergeCrdtGate(options?.themeExperimentJson);
  const hypergraphL6 = evaluateHypergraphL6HolographicAnchorGate(options?.themeExperimentJson);
  const medullaHalt = evaluateMedullaOblongataEmergencyHaltGate(options?.themeExperimentJson);
  const martianOrbital = evaluateMartianOrbitalDtnRelayGate(options?.themeExperimentJson);
  const oecdMesh = evaluateOecdStateAgAiTransparencyMeshGate(options?.themeExperimentJson);
  const multiverseReconciliation = evaluateMultiverseReconciliationCrdtGate(options?.themeExperimentJson);
  const hypergraphL7 = evaluateHypergraphL7EntanglementAnchorGate(options?.themeExperimentJson);
  const ponsBridge = evaluatePonsAutonomicBridgeFailoverGate(options?.themeExperimentJson);
  const jupiterTrojan = evaluateJupiterTrojanDtnLagrangeGate(options?.themeExperimentJson);
  const unRegistry = evaluateUnAiOfficeGlobalRegistryMeshGate(options?.themeExperimentJson);
  const omniverseEpoch = evaluateOmniverseEpochSealCrdtGate(options?.themeExperimentJson);
  const hypergraphL8 = evaluateHypergraphL8FaultTolerantAnchorGate(options?.themeExperimentJson);
  const midbrainPacing = evaluateMidbrainArousalPublishPacingGate(options?.themeExperimentJson);
  const saturnRing = evaluateSaturnRingDtnShepherdGate(options?.themeExperimentJson);
  const aviationRegistry = evaluateIcaoImoAiAviationRegistryGate(options?.themeExperimentJson);
  const metaverseFinality = evaluateMetaverseFinalitySealCrdtGate(options?.themeExperimentJson);
  const hypergraphL9 = evaluateHypergraphL9ByzantineAnchorGate(options?.themeExperimentJson);
  const thalamusGating = evaluateThalamusSensoryGatingPublishGate(options?.themeExperimentJson);
  const uranusPolar = evaluateUranusObliquityDtnPolarRelayGate(options?.themeExperimentJson);
  const tradeRegistry = evaluateWtoUpuCrossBorderAiTradeRegistryGate(options?.themeExperimentJson);
  const causalityLock = evaluateMultiverseCausalityLockCrdtGate(options?.themeExperimentJson);
  const hypergraphL10 = evaluateHypergraphL10QuantumResilientAnchorGate(options?.themeExperimentJson);
  const basalGanglia = evaluateBasalGangliaActionSelectionPublishGate(options?.themeExperimentJson);
  const neptuneHalo = evaluateNeptuneTritonRetrogradeDtnHaloGate(options?.themeExperimentJson);
  const commerceRegistry = evaluateItuUncitralDigitalCommerceAiRegistryGate(options?.themeExperimentJson);
  const epochFreeze = evaluateOmniverseEpochFreezeCrdtGate(options?.themeExperimentJson);
  const hypergraphL11 = evaluateHypergraphL11TopologicalFaultTolerantAnchorGate(options?.themeExperimentJson);
  const cerebellumRefinement = evaluateCerebellumMotorRefinementPublishGate(options?.themeExperimentJson);
  const plutoBarycenter = evaluatePlutoCharonBinaryDtnBarycenterGate(options?.themeExperimentJson);
  const standardsRegistry = evaluateIsoIecAiStandardsHarmonizationRegistryGate(options?.themeExperimentJson);
  const timelineSeal = evaluateMultiverseTimelineSealCrdtGate(options?.themeExperimentJson);
  const hypergraphL12 = evaluateHypergraphL12CategoricalQuantumAnchorGate(options?.themeExperimentJson);
  const motorCortex = evaluateMotorCortexExecutionPublishGate(options?.themeExperimentJson);
  const kuiperAphelion = evaluateKuiperScatteredDiskDtnAphelionGate(options?.themeExperimentJson);
  const governanceRegistry = evaluateCenCenelecDigitalProductGovernanceRegistryGate(options?.themeExperimentJson);
  const branchMergeSeal = evaluateMultiverseBranchMergeSealCrdtGate(options?.themeExperimentJson);
  const hypergraphL13 = evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate(options?.themeExperimentJson);
  const premotorSma = evaluatePremotorSmaPlanningPublishGate(options?.themeExperimentJson);
  const bayesianExtras = {
    bayesianPassed: !isBayesianDecisionEnabled() || bayesian.recommendPublish,
    bayesianProbLift: bayesian.probLiftAboveThreshold,
    geoAdjustedLiftPp: geo.adjustedLiftPp,
    causalForestPassed: causal.passed,
    spilloverPassed: spillover.passed,
    interferencePassed: interference.passed,
    federatedLearningPassed: federated.passed,
    compositionalPassed: compositional.passed,
    quantumSafePassed: quantumSafe.passed,
    holdoutWsPassed: holdoutWs.passed,
    autonomousScientistPassed: scientist.passed,
    euAiActPassed: euAiAct.passed,
    homomorphicMetricsPassed: homomorphic.passed,
    quboBanditPassed: qubo.passed,
    causalDiscoveryPassed: discovery.passed,
    ukAiSafetyPassed: ukAi.passed,
    zkAssignmentFairnessPassed: zkFairness.passed,
    neuromorphicAssignPassed: neuromorphic.passed,
    multiAgentOrchestratorPassed: orchestrator.passed,
    eo14110InventoryPassed: eo14110.passed,
    teeAttestationPassed: tee.passed,
    photonicAssignPassed: photonic.passed,
    globalMeshPassed: globalMesh.passed,
    nistAiRmfPassed: nistRmf.passed,
    dnaAuditTrailPassed: dnaTrail.passed,
    bioNeuronAssignPassed: bioNeuron.passed,
    dtnMeshPassed: dtnMesh.passed,
    ismapNzismPassed: ismapNzism.passed,
    iso42001AiMsPassed: iso42001.passed,
    pqcDnaArchivalPassed: pqcDna.passed,
    wetwareCalibrationPassed: wetware.passed,
    cislunarDtnPassed: cislunar.passed,
    pspfNzDtaPassed: pspfNz.passed,
    iso42001Stage2Passed: iso42001Stage2.passed,
    homomorphicDnaFederationPassed: homDnaFed.passed,
    organoidWetwarePassed: organoid.passed,
    heliopauseDtnPassed: heliopause.passed,
    sociNzGcdoPassed: sociGcdo.passed,
    iso42001CertBodyPassed: certBody.passed,
    zkDnaRollupPassed: zkDnaRollup.passed,
    corticalOrganoidMeshPassed: corticalMesh.passed,
    galacticMeshPassed: galacticMesh.passed,
    fiveEyesCloudCompactPassed: fiveEyes.passed,
    euAiOfficeNotifiedBodyPassed: euAiOffice.passed,
    recursiveZkDnaRollupPassed: recursiveZk.passed,
    hippocampalOrganoidMeshPassed: hippocampal.passed,
    intergalacticMeshFederationPassed: intergalactic.passed,
    fiveEyesPlusCompactPassed: fiveEyesPlus.passed,
    euAiOfficeContinuousConformityPassed: euContinuous.passed,
    productionHardeningPassed: prodHardening.passed,
    strictEnvPassed: strictEnv.passed,
    hypergraphZkDnaPassed: hypergraphZk.passed,
    prefrontalOrganoidMeshPassed: prefrontal.passed,
    indoPacificCompactPassed: indoPacific.passed,
    euAiActLiveRegistryPassed: euLiveRegistry.passed,
    cosmicWebFederationPassed: cosmicWeb.passed,
    hypergraphEvolutionPassed: hypergraphEvolution.passed,
    prefrontalEthicsBoardPassed: ethicsBoard.passed,
    panPacificQuantumMeshPassed: panPacific.passed,
    ukDsitAlgorithmicTransparencyPassed: ukDsit.passed,
    multiverseOutcomeCrdtPassed: multiverse.passed,
    hypergraphL3RecursiveAnchorPassed: hypergraphL3.passed,
    cerebellarMotorOrganoidPassed: cerebellar.passed,
    arcticQuantumMeshPassed: arcticQuantum.passed,
    nistAiRmfLiveControlFeedPassed: nistRmfLive.passed,
    omniverseCausalGraphCrdtPassed: omniverseCausal.passed,
    hypergraphL4MetaAnchorPassed: hypergraphL4.passed,
    brainstemAutonomicGuardPassed: brainstemAutonomic.passed,
    antarcticSubglacialMeshPassed: antarcticSubglacial.passed,
    euAiActArt71PmmLivePassed: euArt71Pmm.passed,
    multiverseCounterfactualCrdtPassed: counterfactualCrdt.passed,
    hypergraphL5CompositionalAnchorPassed: hypergraphL5.passed,
    spinalCordPublishThrottlePassed: spinalThrottle.passed,
    lunarFarsideDtnMeshPassed: lunarFarside.passed,
    usFtcAiTransparencyLivePassed: usFtcLive.passed,
    parallelUniverseMergeCrdtPassed: parallelUniverse.passed,
    hypergraphL6HolographicAnchorPassed: hypergraphL6.passed,
    medullaOblongataEmergencyHaltPassed: medullaHalt.passed,
    martianOrbitalDtnRelayPassed: martianOrbital.passed,
    oecdStateAgAiTransparencyMeshPassed: oecdMesh.passed,
    multiverseReconciliationCrdtPassed: multiverseReconciliation.passed,
    hypergraphL7EntanglementAnchorPassed: hypergraphL7.passed,
    ponsAutonomicBridgeFailoverPassed: ponsBridge.passed,
    jupiterTrojanDtnLagrangePassed: jupiterTrojan.passed,
    unAiOfficeGlobalRegistryMeshPassed: unRegistry.passed,
    omniverseEpochSealCrdtPassed: omniverseEpoch.passed,
    hypergraphL8FaultTolerantAnchorPassed: hypergraphL8.passed,
    midbrainArousalPublishPacingPassed: midbrainPacing.passed,
    saturnRingDtnShepherdPassed: saturnRing.passed,
    icaoImoAiAviationRegistryPassed: aviationRegistry.passed,
    metaverseFinalitySealCrdtPassed: metaverseFinality.passed,
    hypergraphL9ByzantineAnchorPassed: hypergraphL9.passed,
    thalamusSensoryGatingPublishPassed: thalamusGating.passed,
    uranusObliquityDtnPolarRelayPassed: uranusPolar.passed,
    wtoUpuCrossBorderAiTradeRegistryPassed: tradeRegistry.passed,
    multiverseCausalityLockCrdtPassed: causalityLock.passed,
    hypergraphL10QuantumResilientAnchorPassed: hypergraphL10.passed,
    basalGangliaActionSelectionPublishPassed: basalGanglia.passed,
    neptuneTritonRetrogradeDtnHaloPassed: neptuneHalo.passed,
    ituUncitralDigitalCommerceAiRegistryPassed: commerceRegistry.passed,
    omniverseEpochFreezeCrdtPassed: epochFreeze.passed,
    hypergraphL11TopologicalFaultTolerantAnchorPassed: hypergraphL11.passed,
    cerebellumMotorRefinementPublishPassed: cerebellumRefinement.passed,
    plutoCharonBinaryDtnBarycenterPassed: plutoBarycenter.passed,
    isoIecAiStandardsHarmonizationRegistryPassed: standardsRegistry.passed,
    multiverseTimelineSealCrdtPassed: timelineSeal.passed,
    hypergraphL12CategoricalQuantumAnchorPassed: hypergraphL12.passed,
    motorCortexExecutionPublishPassed: motorCortex.passed,
    kuiperScatteredDiskDtnAphelionPassed: kuiperAphelion.passed,
    cenCenelecDigitalProductGovernanceRegistryPassed: governanceRegistry.passed,
    multiverseBranchMergeSealCrdtPassed: branchMergeSeal.passed,
    hypergraphL13HomotopyTypeTheoreticAnchorPassed: hypergraphL13.passed,
    premotorSmaPlanningPublishPassed: premotorSma.passed,
  };

  if (!sig.sampleSizeOk) {
    return {
      recommendation: "insufficient_data",
      headline: "Collect more checkouts",
      detail: `Wait until each arm has at least ${thresholds.minCheckoutsPerArm} checkouts started (currently published ${published.checkouts}, draft ${draft.checkouts}).`,
      liftPp,
      revenueLiftPp,
      significant: false,
      sampleSizeOk: false,
      publishedRate,
      draftRate,
      sequentialPassed: sequential.passedBoundary,
      guardrailsOk,
      ...bayesianExtras,
    };
  }

  const bayesianOk = bayesianExtras.bayesianPassed;
  const publishByFrequentist =
    !isBayesianBqOnlyMode() &&
    sig.significant &&
    sequential.passedBoundary &&
    guardrailsOk &&
    liftPp >= thresholds.minLiftPp;
  const publishByBayesian = isBayesianDecisionEnabled() && bayesian.recommendPublish && guardrailsOk;
  const causalOk = bayesianExtras.causalForestPassed !== false;
  const spilloverOk = bayesianExtras.spilloverPassed !== false;
  const interferenceOk = bayesianExtras.interferencePassed !== false;
  const federatedOk = bayesianExtras.federatedLearningPassed !== false;
  const compositionalOk = bayesianExtras.compositionalPassed !== false;
  const quantumOk = bayesianExtras.quantumSafePassed !== false;
  const holdoutWsOk = bayesianExtras.holdoutWsPassed !== false;
  const scientistOk = bayesianExtras.autonomousScientistPassed !== false;
  const euAiOk = bayesianExtras.euAiActPassed !== false;
  const homomorphicOk = bayesianExtras.homomorphicMetricsPassed !== false;
  const quboOk = bayesianExtras.quboBanditPassed !== false;
  const discoveryOk = bayesianExtras.causalDiscoveryPassed !== false;
  const ukAiOk = bayesianExtras.ukAiSafetyPassed !== false;
  const zkOk = bayesianExtras.zkAssignmentFairnessPassed !== false;
  const neuroOk = bayesianExtras.neuromorphicAssignPassed !== false;
  const orchestratorOk = bayesianExtras.multiAgentOrchestratorPassed !== false;
  const eo14110Ok = bayesianExtras.eo14110InventoryPassed !== false;
  const teeOk = bayesianExtras.teeAttestationPassed !== false;
  const photonicOk = bayesianExtras.photonicAssignPassed !== false;
  const globalMeshOk = bayesianExtras.globalMeshPassed !== false;
  const nistRmfOk = bayesianExtras.nistAiRmfPassed !== false;
  const dnaTrailOk = bayesianExtras.dnaAuditTrailPassed !== false;
  const bioNeuronOk = bayesianExtras.bioNeuronAssignPassed !== false;
  const dtnMeshOk = bayesianExtras.dtnMeshPassed !== false;
  const ismapNzismOk = bayesianExtras.ismapNzismPassed !== false;
  const iso42001Ok = bayesianExtras.iso42001AiMsPassed !== false;
  const pqcDnaOk = bayesianExtras.pqcDnaArchivalPassed !== false;
  const wetwareOk = bayesianExtras.wetwareCalibrationPassed !== false;
  const cislunarOk = bayesianExtras.cislunarDtnPassed !== false;
  const pspfNzOk = bayesianExtras.pspfNzDtaPassed !== false;
  const iso42001Stage2Ok = bayesianExtras.iso42001Stage2Passed !== false;
  const homDnaFedOk = bayesianExtras.homomorphicDnaFederationPassed !== false;
  const organoidOk = bayesianExtras.organoidWetwarePassed !== false;
  const heliopauseOk = bayesianExtras.heliopauseDtnPassed !== false;
  const sociGcdoOk = bayesianExtras.sociNzGcdoPassed !== false;
  const certBodyOk = bayesianExtras.iso42001CertBodyPassed !== false;
  const zkDnaRollupOk = bayesianExtras.zkDnaRollupPassed !== false;
  const corticalMeshOk = bayesianExtras.corticalOrganoidMeshPassed !== false;
  const galacticMeshOk = bayesianExtras.galacticMeshPassed !== false;
  const fiveEyesOk = bayesianExtras.fiveEyesCloudCompactPassed !== false;
  const euAiOfficeOk = bayesianExtras.euAiOfficeNotifiedBodyPassed !== false;
  const recursiveZkOk = bayesianExtras.recursiveZkDnaRollupPassed !== false;
  const hippocampalOk = bayesianExtras.hippocampalOrganoidMeshPassed !== false;
  const intergalacticOk = bayesianExtras.intergalacticMeshFederationPassed !== false;
  const fiveEyesPlusOk = bayesianExtras.fiveEyesPlusCompactPassed !== false;
  const euContinuousOk = bayesianExtras.euAiOfficeContinuousConformityPassed !== false;
  const prodHardeningOk = bayesianExtras.productionHardeningPassed !== false;
  const strictEnvOk = bayesianExtras.strictEnvPassed !== false;
  const hypergraphZkOk = bayesianExtras.hypergraphZkDnaPassed !== false;
  const prefrontalOk = bayesianExtras.prefrontalOrganoidMeshPassed !== false;
  const indoPacificOk = bayesianExtras.indoPacificCompactPassed !== false;
  const euLiveRegistryOk = bayesianExtras.euAiActLiveRegistryPassed !== false;
  const cosmicWebOk = bayesianExtras.cosmicWebFederationPassed !== false;
  const hypergraphEvolutionOk = bayesianExtras.hypergraphEvolutionPassed !== false;
  const ethicsBoardOk = bayesianExtras.prefrontalEthicsBoardPassed !== false;
  const panPacificOk = bayesianExtras.panPacificQuantumMeshPassed !== false;
  const ukDsitOk = bayesianExtras.ukDsitAlgorithmicTransparencyPassed !== false;
  const multiverseOk = bayesianExtras.multiverseOutcomeCrdtPassed !== false;
  const hypergraphL3Ok = bayesianExtras.hypergraphL3RecursiveAnchorPassed !== false;
  const cerebellarOk = bayesianExtras.cerebellarMotorOrganoidPassed !== false;
  const arcticQuantumOk = bayesianExtras.arcticQuantumMeshPassed !== false;
  const nistRmfLiveOk = bayesianExtras.nistAiRmfLiveControlFeedPassed !== false;
  const omniverseCausalOk = bayesianExtras.omniverseCausalGraphCrdtPassed !== false;
  const hypergraphL4Ok = bayesianExtras.hypergraphL4MetaAnchorPassed !== false;
  const brainstemAutonomicOk = bayesianExtras.brainstemAutonomicGuardPassed !== false;
  const antarcticSubglacialOk = bayesianExtras.antarcticSubglacialMeshPassed !== false;
  const euArt71PmmOk = bayesianExtras.euAiActArt71PmmLivePassed !== false;
  const counterfactualCrdtOk = bayesianExtras.multiverseCounterfactualCrdtPassed !== false;
  const hypergraphL5Ok = bayesianExtras.hypergraphL5CompositionalAnchorPassed !== false;
  const spinalThrottleOk = bayesianExtras.spinalCordPublishThrottlePassed !== false;
  const lunarFarsideOk = bayesianExtras.lunarFarsideDtnMeshPassed !== false;
  const usFtcLiveOk = bayesianExtras.usFtcAiTransparencyLivePassed !== false;
  const parallelUniverseOk = bayesianExtras.parallelUniverseMergeCrdtPassed !== false;
  const hypergraphL6Ok = bayesianExtras.hypergraphL6HolographicAnchorPassed !== false;
  const medullaHaltOk = bayesianExtras.medullaOblongataEmergencyHaltPassed !== false;
  const martianOrbitalOk = bayesianExtras.martianOrbitalDtnRelayPassed !== false;
  const oecdMeshOk = bayesianExtras.oecdStateAgAiTransparencyMeshPassed !== false;
  const multiverseReconciliationOk = bayesianExtras.multiverseReconciliationCrdtPassed !== false;
  const hypergraphL7Ok = bayesianExtras.hypergraphL7EntanglementAnchorPassed !== false;
  const ponsBridgeOk = bayesianExtras.ponsAutonomicBridgeFailoverPassed !== false;
  const jupiterTrojanOk = bayesianExtras.jupiterTrojanDtnLagrangePassed !== false;
  const unRegistryOk = bayesianExtras.unAiOfficeGlobalRegistryMeshPassed !== false;
  const omniverseEpochOk = bayesianExtras.omniverseEpochSealCrdtPassed !== false;
  const hypergraphL8Ok = bayesianExtras.hypergraphL8FaultTolerantAnchorPassed !== false;
  const midbrainPacingOk = bayesianExtras.midbrainArousalPublishPacingPassed !== false;
  const saturnRingOk = bayesianExtras.saturnRingDtnShepherdPassed !== false;
  const aviationRegistryOk = bayesianExtras.icaoImoAiAviationRegistryPassed !== false;
  const metaverseFinalityOk = bayesianExtras.metaverseFinalitySealCrdtPassed !== false;
  const hypergraphL9Ok = bayesianExtras.hypergraphL9ByzantineAnchorPassed !== false;
  const thalamusGatingOk = bayesianExtras.thalamusSensoryGatingPublishPassed !== false;
  const uranusPolarOk = bayesianExtras.uranusObliquityDtnPolarRelayPassed !== false;
  const tradeRegistryOk = bayesianExtras.wtoUpuCrossBorderAiTradeRegistryPassed !== false;
  const causalityLockOk = bayesianExtras.multiverseCausalityLockCrdtPassed !== false;
  const hypergraphL10Ok = bayesianExtras.hypergraphL10QuantumResilientAnchorPassed !== false;
  const basalGangliaOk = bayesianExtras.basalGangliaActionSelectionPublishPassed !== false;
  const neptuneHaloOk = bayesianExtras.neptuneTritonRetrogradeDtnHaloPassed !== false;
  const commerceRegistryOk = bayesianExtras.ituUncitralDigitalCommerceAiRegistryPassed !== false;
  const epochFreezeOk = bayesianExtras.omniverseEpochFreezeCrdtPassed !== false;
  const hypergraphL11Ok = bayesianExtras.hypergraphL11TopologicalFaultTolerantAnchorPassed !== false;
  const cerebellumRefinementOk = bayesianExtras.cerebellumMotorRefinementPublishPassed !== false;
  const plutoBarycenterOk = bayesianExtras.plutoCharonBinaryDtnBarycenterPassed !== false;
  const standardsRegistryOk = bayesianExtras.isoIecAiStandardsHarmonizationRegistryPassed !== false;
  const timelineSealOk = bayesianExtras.multiverseTimelineSealCrdtPassed !== false;
  const hypergraphL12Ok = bayesianExtras.hypergraphL12CategoricalQuantumAnchorPassed !== false;
  const motorCortexOk = bayesianExtras.motorCortexExecutionPublishPassed !== false;
  const kuiperAphelionOk = bayesianExtras.kuiperScatteredDiskDtnAphelionPassed !== false;
  const governanceRegistryOk = bayesianExtras.cenCenelecDigitalProductGovernanceRegistryPassed !== false;
  const branchMergeSealOk = bayesianExtras.multiverseBranchMergeSealCrdtPassed !== false;
  const hypergraphL13Ok = bayesianExtras.hypergraphL13HomotopyTypeTheoreticAnchorPassed !== false;
  const premotorSmaOk = bayesianExtras.premotorSmaPlanningPublishPassed !== false;

  if (
    (publishByFrequentist || publishByBayesian) &&
    causalOk &&
    spilloverOk &&
    interferenceOk &&
    federatedOk &&
    compositionalOk &&
    quantumOk &&
    holdoutWsOk &&
    scientistOk &&
    euAiOk &&
    homomorphicOk &&
    quboOk &&
    discoveryOk &&
    ukAiOk &&
    zkOk &&
    neuroOk &&
    orchestratorOk &&
    eo14110Ok &&
    teeOk &&
    photonicOk &&
    globalMeshOk &&
    nistRmfOk &&
    dnaTrailOk &&
    bioNeuronOk &&
    dtnMeshOk &&
    ismapNzismOk &&
    iso42001Ok &&
    pqcDnaOk &&
    wetwareOk &&
    cislunarOk &&
    pspfNzOk &&
    iso42001Stage2Ok &&
    homDnaFedOk &&
    organoidOk &&
    heliopauseOk &&
    sociGcdoOk &&
    certBodyOk &&
    zkDnaRollupOk &&
    corticalMeshOk &&
    galacticMeshOk &&
    fiveEyesOk &&
    euAiOfficeOk &&
    recursiveZkOk &&
    hippocampalOk &&
    intergalacticOk &&
    fiveEyesPlusOk &&
    euContinuousOk &&
    prodHardeningOk &&
    strictEnvOk &&
    hypergraphZkOk &&
    prefrontalOk &&
    indoPacificOk &&
    euLiveRegistryOk &&
    cosmicWebOk &&
    hypergraphEvolutionOk &&
    ethicsBoardOk &&
    panPacificOk &&
    ukDsitOk &&
    multiverseOk &&
    hypergraphL3Ok &&
    cerebellarOk &&
    arcticQuantumOk &&
    nistRmfLiveOk &&
    omniverseCausalOk &&
    hypergraphL4Ok &&
    brainstemAutonomicOk &&
    antarcticSubglacialOk &&
    euArt71PmmOk &&
    counterfactualCrdtOk &&
    hypergraphL5Ok &&
    spinalThrottleOk &&
    lunarFarsideOk &&
    usFtcLiveOk &&
    parallelUniverseOk &&
    hypergraphL6Ok &&
    medullaHaltOk &&
    martianOrbitalOk &&
    oecdMeshOk &&
    multiverseReconciliationOk &&
    hypergraphL7Ok &&
    ponsBridgeOk &&
    jupiterTrojanOk &&
    unRegistryOk &&
    omniverseEpochOk &&
    hypergraphL8Ok &&
    midbrainPacingOk &&
    saturnRingOk &&
    aviationRegistryOk &&
    metaverseFinalityOk &&
    hypergraphL9Ok &&
    thalamusGatingOk &&
    uranusPolarOk &&
    tradeRegistryOk &&
    causalityLockOk &&
    hypergraphL10Ok &&
    basalGangliaOk &&
    neptuneHaloOk &&
    commerceRegistryOk &&
    epochFreezeOk &&
    hypergraphL11Ok &&
    cerebellumRefinementOk &&
    plutoBarycenterOk &&
    standardsRegistryOk &&
    timelineSealOk &&
    hypergraphL12Ok &&
    motorCortexOk &&
    kuiperAphelionOk &&
    governanceRegistryOk &&
    branchMergeSealOk &&
    hypergraphL13Ok &&
    premotorSmaOk
  ) {
    return {
      recommendation: "publish_draft",
      headline: publishByBayesian ? bayesian.headline : "Consider publishing draft theme",
      detail: publishByBayesian
        ? `${bayesian.detail} ${geo.headline}`
        : `Draft beats published by ${liftPp} pp (revenue proxy +${revenueLiftPp} pp) with p < ${thresholds.alpha}. ${sequential.headline}`,
      liftPp: publishByBayesian ? bayesian.liftPp : liftPp,
      revenueLiftPp,
      significant: true,
      sampleSizeOk: true,
      publishedRate,
      draftRate,
      sequentialPassed: sequential.passedBoundary,
      guardrailsOk,
      ...bayesianExtras,
    };
  }

  if (sig.significant && liftPp < 0) {
    return {
      recommendation: "keep_published",
      headline: "Keep published theme",
      detail: `Published arm wins by ${Math.abs(liftPp)} pp. Disable the experiment or lower draft traffic.`,
      liftPp,
      revenueLiftPp,
      significant: true,
      sampleSizeOk: true,
      publishedRate,
      draftRate,
      sequentialPassed: sequential.passedBoundary,
      guardrailsOk,
      ...bayesianExtras,
    };
  }

  const guardrailNote = !guardrailsOk ? " Multi-metric guardrails not met." : "";
  const seqNote = !sequential.passedBoundary ? ` ${sequential.detail}` : "";
  const bayesNote = isBayesianDecisionEnabled() && !bayesianOk ? ` ${bayesian.headline}` : "";
  const causalNote = !causalOk ? ` ${causal.headline}` : "";
  const spilloverNote = !spilloverOk ? ` ${spillover.headline}` : "";
  const interferenceNote = !interferenceOk ? ` ${interference.headline}` : "";
  const federatedNote = !federatedOk ? ` ${federated.headline}` : "";
  const compositionalNote = !compositionalOk ? ` ${compositional.headline}` : "";

  return {
    recommendation: "inconclusive",
    headline: "No clear winner yet",
    detail: `Lift ${liftPp > 0 ? "+" : ""}${liftPp} pp is below +${thresholds.minLiftPp} pp threshold or not statistically significant.${guardrailNote}${seqNote}${bayesNote}${causalNote}${spilloverNote}${interferenceNote}${federatedNote}${compositionalNote}`,
    liftPp,
    revenueLiftPp,
    significant: sig.significant,
    sampleSizeOk: true,
    publishedRate,
    draftRate,
    sequentialPassed: sequential.passedBoundary,
    guardrailsOk,
    ...bayesianExtras,
  };
}
