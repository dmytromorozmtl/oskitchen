import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { coalesceThemeExperimentJson, toInputJsonValue, toJsonValue } from "@/lib/prisma/json";
import { isStorefrontExperimentsEnabled } from "@/lib/storefront/storefront-experiments-enabled";
import { themeSnapshotCacheTag } from "@/lib/storefront/cdn-cache";
import { purgeStorefrontCdnAfterThemePublish } from "@/lib/storefront/cdn-purge";
import { countBlockingEdgeSyncJobs } from "@/services/storefront/storefront-edge-sync-job-service";
import { concludeThemeExperimentLifecycle } from "@/services/storefront/theme-experiment-lifecycle-service";
import { auditStorefrontThemePublish } from "@/lib/storefront/storefront-audit";
import { parseThemeDraft, resolveThemeCustomizer } from "@/lib/storefront/theme-draft";
import { buildThemeSnapshotV1 } from "@/lib/storefront/theme-snapshot";
import { recordStorefrontThemeVersion } from "@/services/storefront/storefront-theme-version-service";
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
import { appendDnaAuditBlock, isDnaAuditTrailEnabled } from "@/lib/compliance/dna-encoded-audit-trail";
import { evaluatePqcDnaArchivalGate } from "@/lib/compliance/pqc-dna-archival";
import { evaluateWetwareCalibrationGate } from "@/lib/storefront/theme-experiment-wetware-calibration";
import { evaluateCislunarDtnPublishGate } from "@/lib/storefront/theme-experiment-cislunar-dtn";
import { evaluatePspfNzDtaPublishGate } from "@/lib/compliance/pspf-nz-dta-crosswalk";
import { evaluateIso42001Stage2PublishGate } from "@/lib/compliance/iso-42001-stage2";
import {
  isPqcDnaArchivalEnabled,
  sealPqcDnaArchivalFromTrail,
} from "@/lib/compliance/pqc-dna-archival";
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
import { recordSpinalPublishAttempt } from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import { evaluateLunarFarsideDtnMeshGate } from "@/lib/storefront/theme-experiment-lunar-farside-dtn-mesh";
import { evaluateUsFtcAiTransparencyLiveGate } from "@/lib/compliance/us-ftc-ai-transparency-live-feed";
import { evaluateParallelUniverseMergeCrdtGate } from "@/lib/storefront/theme-experiment-parallel-universe-merge-crdt";
import { evaluateHypergraphL6HolographicAnchorGate } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import { syncMedullaFromSpinalAndEthics } from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";
import { evaluateMartianOrbitalDtnRelayGate } from "@/lib/storefront/theme-experiment-martian-orbital-dtn-relay";
import { evaluateOecdStateAgAiTransparencyMeshGate } from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import { evaluateMultiverseReconciliationCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-reconciliation-crdt";
import { evaluateHypergraphL7EntanglementAnchorGate } from "@/lib/compliance/hypergraph-l7-entanglement-anchor";
import {
  evaluateMedullaWithPonsPublishGate,
  evaluatePonsAutonomicBridgeFailoverGate,
  syncPonsFromMedullaAndSpinal,
} from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import { evaluateJupiterTrojanDtnLagrangeGate } from "@/lib/storefront/theme-experiment-jupiter-trojan-dtn-lagrange";
import { evaluateUnAiOfficeGlobalRegistryMeshGate } from "@/lib/compliance/un-ai-office-global-registry-mesh";
import { evaluateOmniverseEpochSealCrdtGate } from "@/lib/storefront/theme-experiment-omniverse-epoch-seal-crdt";
import { evaluateHypergraphL8FaultTolerantAnchorGate } from "@/lib/compliance/hypergraph-l8-fault-tolerant-anchor";
import {
  syncMidbrainFromPonsAndSpinal,
} from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import { syncThalamusFromMidbrainAndSpinal } from "@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish";
import { syncBasalGangliaFromThalamusAndMidbrain } from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";
import { syncCerebellumFromBasalGangliaAndMidbrain } from "@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish";
import { syncMotorCortexFromCerebellumAndMidbrain } from "@/lib/storefront/theme-experiment-motor-cortex-execution-publish";
import {
  evaluateMidbrainWithPremotorSmaMotorCortexCerebellumBasalGangliaAndThalamusPublishGate,
  syncPremotorSmaFromMotorCortexAndEthics,
} from "@/lib/storefront/theme-experiment-premotor-sma-planning-publish";
import { evaluateNeptuneTritonRetrogradeDtnHaloGate } from "@/lib/storefront/theme-experiment-neptune-triton-retrograde-dtn-halo";
import { evaluatePlutoCharonBinaryDtnBarycenterGate } from "@/lib/storefront/theme-experiment-pluto-charon-binary-dtn-barycenter";
import { evaluateItuUncitralDigitalCommerceAiRegistryGate } from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";
import { evaluateIsoIecAiStandardsHarmonizationRegistryGate } from "@/lib/compliance/iso-iec-ai-standards-harmonization-registry";
import { evaluateOmniverseEpochFreezeCrdtGate } from "@/lib/storefront/theme-experiment-omniverse-epoch-freeze-crdt";
import { evaluateMultiverseTimelineSealCrdtGate } from "@/lib/storefront/theme-experiment-multiverse-timeline-seal-crdt";
import { evaluateHypergraphL11TopologicalFaultTolerantAnchorGate } from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";
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

function extractNavItemsForSnapshot(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "items" in raw) {
    return (raw as { items: unknown }).items;
  }
  return [];
}

function extractFooterBlocksForSnapshot(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "blocks" in raw) {
    return (raw as { blocks: unknown }).blocks;
  }
  return [];
}

export async function publishStorefrontThemeSnapshot(params: { userId: string; storefrontId: string }): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: params.storefrontId, userId: params.userId },
    include: { navigation: true, footer: true },
  });
  if (!sf) return { ok: false, error: "Storefront not found." };

  const experimentsOn = isStorefrontExperimentsEnabled();

  if (experimentsOn) {
  const spillover = evaluateSpilloverPublishGate(sf.themeExperimentJson);
  if (!spillover.passed) {
    return { ok: false, error: spillover.headline };
  }

  const interference = evaluateInterferencePublishGate(sf.themeExperimentJson);
  if (!interference.passed) {
    return { ok: false, error: interference.headline };
  }

  const federated = evaluateFederatedLearningPublishGate(sf.themeExperimentJson);
  if (!federated.passed) {
    return { ok: false, error: federated.headline };
  }

  const compositional = evaluateCompositionalPublishGate(sf.themeExperimentJson);
  if (!compositional.passed) {
    return { ok: false, error: compositional.headline };
  }

  const quantumSafe = evaluateQuantumSafePublishGate(sf.themeExperimentJson);
  if (!quantumSafe.passed) {
    return { ok: false, error: quantumSafe.headline };
  }

  const holdoutWs = evaluateHoldoutWsGate(sf.themeExperimentJson);
  if (!holdoutWs.passed) {
    return { ok: false, error: holdoutWs.headline };
  }

  const scientist = evaluateAutonomousScientistGate(sf.themeExperimentJson);
  if (!scientist.passed) {
    return { ok: false, error: scientist.headline };
  }

  const euAiAct = evaluateEuAiActPublishGate(sf.themeExperimentJson);
  if (!euAiAct.passed) {
    return { ok: false, error: euAiAct.headline };
  }

  const homomorphic = evaluateHomomorphicMetricsPublishGate(sf.themeExperimentJson);
  if (!homomorphic.passed) {
    return { ok: false, error: homomorphic.headline };
  }

  const qubo = evaluateQuboBanditGate(sf.themeExperimentJson);
  if (!qubo.passed) {
    return { ok: false, error: qubo.headline };
  }

  const discovery = evaluateCausalDiscoveryAgentGate(sf.themeExperimentJson);
  if (!discovery.passed) {
    return { ok: false, error: discovery.headline };
  }

  const ukAi = evaluateUkAiSafetyPublishGate(sf.themeExperimentJson);
  if (!ukAi.passed) {
    return { ok: false, error: ukAi.headline };
  }

  const zkFairness = evaluateZkAssignmentFairnessGate(sf.themeExperimentJson);
  if (!zkFairness.passed) {
    return { ok: false, error: zkFairness.headline };
  }

  const neuromorphic = evaluateNeuromorphicAssignGate(sf.themeExperimentJson);
  if (!neuromorphic.passed) {
    return { ok: false, error: neuromorphic.headline };
  }

  const orchestrator = evaluateMultiAgentOrchestratorGate(sf.themeExperimentJson);
  if (!orchestrator.passed) {
    return { ok: false, error: orchestrator.headline };
  }

  const eo14110 = evaluateEo14110InventoryPublishGate(sf.themeExperimentJson);
  if (!eo14110.passed) {
    return { ok: false, error: eo14110.headline };
  }

  const tee = evaluateTeeAttestationPublishGate(sf.themeExperimentJson);
  if (!tee.passed) {
    return { ok: false, error: tee.headline };
  }

  const photonic = evaluatePhotonicAssignGate(sf.themeExperimentJson);
  if (!photonic.passed) {
    return { ok: false, error: photonic.headline };
  }

  const globalMesh = evaluateGlobalMeshPublishGate(sf.themeExperimentJson);
  if (!globalMesh.passed) {
    return { ok: false, error: globalMesh.headline };
  }

  const nistRmf = evaluateNistAiRmfPublishGate(sf.themeExperimentJson);
  if (!nistRmf.passed) {
    return { ok: false, error: nistRmf.headline };
  }

  const dnaTrail = evaluateDnaAuditTrailGate(sf.themeExperimentJson);
  if (!dnaTrail.passed) {
    return { ok: false, error: dnaTrail.headline };
  }

  const bioNeuron = evaluateBioNeuronAssignGate(sf.themeExperimentJson);
  if (!bioNeuron.passed) {
    return { ok: false, error: bioNeuron.headline };
  }

  const dtnMesh = evaluateDtnMeshPublishGate(sf.themeExperimentJson);
  if (!dtnMesh.passed) {
    return { ok: false, error: dtnMesh.headline };
  }

  const ismapNzism = evaluateIsmapNzismPublishGate(sf.themeExperimentJson);
  if (!ismapNzism.passed) {
    return { ok: false, error: ismapNzism.headline };
  }

  const iso42001 = evaluateIso42001AiMsPublishGate(sf.themeExperimentJson);
  if (!iso42001.passed) {
    return { ok: false, error: iso42001.headline };
  }

  const pqcDna = evaluatePqcDnaArchivalGate(sf.themeExperimentJson);
  if (!pqcDna.passed) {
    return { ok: false, error: pqcDna.headline };
  }

  const wetware = evaluateWetwareCalibrationGate(sf.themeExperimentJson);
  if (!wetware.passed) {
    return { ok: false, error: wetware.headline };
  }

  const cislunar = evaluateCislunarDtnPublishGate(sf.themeExperimentJson);
  if (!cislunar.passed) {
    return { ok: false, error: cislunar.headline };
  }

  const pspfNz = evaluatePspfNzDtaPublishGate(sf.themeExperimentJson);
  if (!pspfNz.passed) {
    return { ok: false, error: pspfNz.headline };
  }

  const iso42001Stage2 = evaluateIso42001Stage2PublishGate(sf.themeExperimentJson);
  if (!iso42001Stage2.passed) {
    return { ok: false, error: iso42001Stage2.headline };
  }

  const homDnaFed = evaluateHomomorphicDnaFederationGate(sf.themeExperimentJson);
  if (!homDnaFed.passed) {
    return { ok: false, error: homDnaFed.headline };
  }

  const organoid = evaluateOrganoidWetwareGate(sf.themeExperimentJson);
  if (!organoid.passed) {
    return { ok: false, error: organoid.headline };
  }

  const heliopause = evaluateHeliopauseDtnPublishGate(sf.themeExperimentJson);
  if (!heliopause.passed) {
    return { ok: false, error: heliopause.headline };
  }

  const sociGcdo = evaluateSociNzGcdoPublishGate(sf.themeExperimentJson);
  if (!sociGcdo.passed) {
    return { ok: false, error: sociGcdo.headline };
  }

  const certBody = evaluateIso42001CertBodyPublishGate(sf.themeExperimentJson);
  if (!certBody.passed) {
    return { ok: false, error: certBody.headline };
  }

  const zkDnaRollup = evaluateZkDnaRollupGate(sf.themeExperimentJson);
  if (!zkDnaRollup.passed) {
    return { ok: false, error: zkDnaRollup.headline };
  }

  const corticalMesh = evaluateCorticalOrganoidMeshGate(sf.themeExperimentJson);
  if (!corticalMesh.passed) {
    return { ok: false, error: corticalMesh.headline };
  }

  const galacticMesh = evaluateGalacticMeshPublishGate(sf.themeExperimentJson);
  if (!galacticMesh.passed) {
    return { ok: false, error: galacticMesh.headline };
  }

  const fiveEyes = evaluateFiveEyesCloudCompactGate(sf.themeExperimentJson);
  if (!fiveEyes.passed) {
    return { ok: false, error: fiveEyes.headline };
  }

  const euAiOffice = evaluateEuAiOfficeNotifiedBodyGate(sf.themeExperimentJson);
  if (!euAiOffice.passed) {
    return { ok: false, error: euAiOffice.headline };
  }

  const recursiveZk = evaluateRecursiveZkDnaRollupGate(sf.themeExperimentJson);
  if (!recursiveZk.passed) {
    return { ok: false, error: recursiveZk.headline };
  }

  const hippocampal = evaluateHippocampalOrganoidMeshGate(sf.themeExperimentJson);
  if (!hippocampal.passed) {
    return { ok: false, error: hippocampal.headline };
  }

  const intergalactic = evaluateIntergalacticMeshFederationGate(sf.themeExperimentJson);
  if (!intergalactic.passed) {
    return { ok: false, error: intergalactic.headline };
  }

  const fiveEyesPlus = evaluateFiveEyesPlusCompactGate(sf.themeExperimentJson);
  if (!fiveEyesPlus.passed) {
    return { ok: false, error: fiveEyesPlus.headline };
  }

  const euContinuous = evaluateEuAiOfficeContinuousConformityGate(sf.themeExperimentJson);
  if (!euContinuous.passed) {
    return { ok: false, error: euContinuous.headline };
  }

  const strictEnv = evaluateStrictEnvGate();
  if (!strictEnv.passed) {
    return { ok: false, error: strictEnv.headline };
  }

  const prodHardening = evaluateProductionHardeningGate(sf.themeExperimentJson);
  if (!prodHardening.passed) {
    return { ok: false, error: prodHardening.headline };
  }

  const hypergraphZk = evaluateHypergraphZkDnaGate(sf.themeExperimentJson);
  if (!hypergraphZk.passed) {
    return { ok: false, error: hypergraphZk.headline };
  }

  const prefrontal = evaluatePrefrontalOrganoidMeshGate(sf.themeExperimentJson);
  if (!prefrontal.passed) {
    return { ok: false, error: prefrontal.headline };
  }

  const indoPacific = evaluateIndoPacificCompactGate(sf.themeExperimentJson);
  if (!indoPacific.passed) {
    return { ok: false, error: indoPacific.headline };
  }

  const euLiveRegistry = evaluateEuAiActLiveRegistryGate(sf.themeExperimentJson);
  if (!euLiveRegistry.passed) {
    return { ok: false, error: euLiveRegistry.headline };
  }

  const cosmicWeb = evaluateCosmicWebFederationGate(sf.themeExperimentJson);
  if (!cosmicWeb.passed) {
    return { ok: false, error: cosmicWeb.headline };
  }

  const hypergraphEvolution = evaluateHypergraphEvolutionGate(sf.themeExperimentJson);
  if (!hypergraphEvolution.passed) {
    return { ok: false, error: hypergraphEvolution.headline };
  }

  const ethicsBoard = evaluatePrefrontalEthicsBoardGate(sf.themeExperimentJson);
  if (!ethicsBoard.passed) {
    return { ok: false, error: ethicsBoard.headline };
  }

  const panPacific = evaluatePanPacificQuantumMeshGate(sf.themeExperimentJson);
  if (!panPacific.passed) {
    return { ok: false, error: panPacific.headline };
  }

  const ukDsit = evaluateUkDsitAlgorithmicTransparencyGate(sf.themeExperimentJson);
  if (!ukDsit.passed) {
    return { ok: false, error: ukDsit.headline };
  }

  const multiverse = evaluateMultiverseOutcomeCrdtGate(sf.themeExperimentJson);
  if (!multiverse.passed) {
    return { ok: false, error: multiverse.headline };
  }

  const hypergraphL3 = evaluateHypergraphL3RecursiveAnchorGate(sf.themeExperimentJson);
  if (!hypergraphL3.passed) {
    return { ok: false, error: hypergraphL3.headline };
  }

  const cerebellar = evaluateCerebellarMotorOrganoidGate(sf.themeExperimentJson);
  if (!cerebellar.passed) {
    return { ok: false, error: cerebellar.headline };
  }

  const arcticQuantum = evaluateArcticQuantumMeshGate(sf.themeExperimentJson);
  if (!arcticQuantum.passed) {
    return { ok: false, error: arcticQuantum.headline };
  }

  const nistRmfLive = evaluateNistAiRmfLiveControlFeedGate(sf.themeExperimentJson);
  if (!nistRmfLive.passed) {
    return { ok: false, error: nistRmfLive.headline };
  }

  const omniverseCausal = evaluateOmniverseCausalGraphCrdtGate(sf.themeExperimentJson);
  if (!omniverseCausal.passed) {
    return { ok: false, error: omniverseCausal.headline };
  }

  const hypergraphL4 = evaluateHypergraphL4MetaAnchorGate(sf.themeExperimentJson);
  if (!hypergraphL4.passed) {
    return { ok: false, error: hypergraphL4.headline };
  }

  const brainstemAutonomic = evaluateBrainstemAutonomicGuardGate(sf.themeExperimentJson);
  if (!brainstemAutonomic.passed) {
    return { ok: false, error: brainstemAutonomic.headline };
  }

  const antarcticSubglacial = evaluateAntarcticSubglacialMeshGate(sf.themeExperimentJson);
  if (!antarcticSubglacial.passed) {
    return { ok: false, error: antarcticSubglacial.headline };
  }

  const euArt71Pmm = evaluateEuAiActArt71PmmLiveGate(sf.themeExperimentJson);
  if (!euArt71Pmm.passed) {
    return { ok: false, error: euArt71Pmm.headline };
  }

  const counterfactualCrdt = evaluateMultiverseCounterfactualCrdtGate(sf.themeExperimentJson);
  if (!counterfactualCrdt.passed) {
    return { ok: false, error: counterfactualCrdt.headline };
  }

  const hypergraphL5 = evaluateHypergraphL5CompositionalAnchorGate(sf.themeExperimentJson);
  if (!hypergraphL5.passed) {
    return { ok: false, error: hypergraphL5.headline };
  }

  let publishJson = coalesceThemeExperimentJson(sf.themeExperimentJson);
  const spinalRecorded = recordSpinalPublishAttempt(publishJson);
  publishJson = toJsonValue(spinalRecorded.json);

  const lunarFarside = evaluateLunarFarsideDtnMeshGate(publishJson);
  if (!lunarFarside.passed) {
    return { ok: false, error: lunarFarside.headline };
  }

  const usFtcLive = evaluateUsFtcAiTransparencyLiveGate(publishJson);
  if (!usFtcLive.passed) {
    return { ok: false, error: usFtcLive.headline };
  }

  const parallelUniverse = evaluateParallelUniverseMergeCrdtGate(publishJson);
  if (!parallelUniverse.passed) {
    return { ok: false, error: parallelUniverse.headline };
  }

  const hypergraphL6 = evaluateHypergraphL6HolographicAnchorGate(publishJson);
  if (!hypergraphL6.passed) {
    return { ok: false, error: hypergraphL6.headline };
  }

  const medullaRecorded = syncMedullaFromSpinalAndEthics(publishJson);
  publishJson = toJsonValue(medullaRecorded.json);
  const ponsRecorded = syncPonsFromMedullaAndSpinal(publishJson);
  publishJson = toJsonValue(ponsRecorded.json);
  const medullaHalt = evaluateMedullaWithPonsPublishGate(publishJson);
  if (!medullaHalt.passed) {
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(publishJson) },
    });
    return { ok: false, error: medullaHalt.headline };
  }
  const ponsBridge = evaluatePonsAutonomicBridgeFailoverGate(publishJson);
  if (!ponsBridge.passed) {
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(publishJson) },
    });
    return { ok: false, error: ponsBridge.headline };
  }

  const midbrainRecorded = syncMidbrainFromPonsAndSpinal(publishJson);
  publishJson = toJsonValue(midbrainRecorded.json);
  const thalamusRecorded = syncThalamusFromMidbrainAndSpinal(publishJson);
  publishJson = toJsonValue(thalamusRecorded.json);
  const basalGangliaRecorded = syncBasalGangliaFromThalamusAndMidbrain(publishJson);
  publishJson = toJsonValue(basalGangliaRecorded.json);
  const cerebellumRecorded = syncCerebellumFromBasalGangliaAndMidbrain(publishJson);
  publishJson = toJsonValue(cerebellumRecorded.json);
  const motorCortexRecorded = syncMotorCortexFromCerebellumAndMidbrain(publishJson);
  publishJson = toJsonValue(motorCortexRecorded.json);
  const premotorRecorded = syncPremotorSmaFromMotorCortexAndEthics(publishJson);
  publishJson = toJsonValue(premotorRecorded.json);
  const midbrainPacing = evaluateMidbrainWithPremotorSmaMotorCortexCerebellumBasalGangliaAndThalamusPublishGate(publishJson);
  if (!midbrainPacing.passed) {
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(publishJson) },
    });
    return { ok: false, error: midbrainPacing.headline };
  }

  const martianOrbital = evaluateMartianOrbitalDtnRelayGate(publishJson);
  if (!martianOrbital.passed) {
    return { ok: false, error: martianOrbital.headline };
  }

  const oecdMesh = evaluateOecdStateAgAiTransparencyMeshGate(publishJson);
  if (!oecdMesh.passed) {
    return { ok: false, error: oecdMesh.headline };
  }

  const multiverseReconciliation = evaluateMultiverseReconciliationCrdtGate(publishJson);
  if (!multiverseReconciliation.passed) {
    return { ok: false, error: multiverseReconciliation.headline };
  }

  const hypergraphL7 = evaluateHypergraphL7EntanglementAnchorGate(publishJson);
  if (!hypergraphL7.passed) {
    return { ok: false, error: hypergraphL7.headline };
  }

  const jupiterTrojan = evaluateJupiterTrojanDtnLagrangeGate(publishJson);
  if (!jupiterTrojan.passed) {
    return { ok: false, error: jupiterTrojan.headline };
  }

  const unRegistry = evaluateUnAiOfficeGlobalRegistryMeshGate(publishJson);
  if (!unRegistry.passed) {
    return { ok: false, error: unRegistry.headline };
  }

  const omniverseEpoch = evaluateOmniverseEpochSealCrdtGate(publishJson);
  if (!omniverseEpoch.passed) {
    return { ok: false, error: omniverseEpoch.headline };
  }

  const hypergraphL8 = evaluateHypergraphL8FaultTolerantAnchorGate(publishJson);
  if (!hypergraphL8.passed) {
    return { ok: false, error: hypergraphL8.headline };
  }

  const saturnRing = evaluateSaturnRingDtnShepherdGate(publishJson);
  if (!saturnRing.passed) {
    return { ok: false, error: saturnRing.headline };
  }

  const aviationRegistry = evaluateIcaoImoAiAviationRegistryGate(publishJson);
  if (!aviationRegistry.passed) {
    return { ok: false, error: aviationRegistry.headline };
  }

  const metaverseFinality = evaluateMetaverseFinalitySealCrdtGate(publishJson);
  if (!metaverseFinality.passed) {
    return { ok: false, error: metaverseFinality.headline };
  }

  const hypergraphL9 = evaluateHypergraphL9ByzantineAnchorGate(publishJson);
  if (!hypergraphL9.passed) {
    return { ok: false, error: hypergraphL9.headline };
  }

  const uranusPolar = evaluateUranusObliquityDtnPolarRelayGate(publishJson);
  if (!uranusPolar.passed) {
    return { ok: false, error: uranusPolar.headline };
  }

  const tradeRegistry = evaluateWtoUpuCrossBorderAiTradeRegistryGate(publishJson);
  if (!tradeRegistry.passed) {
    return { ok: false, error: tradeRegistry.headline };
  }

  const causalityLock = evaluateMultiverseCausalityLockCrdtGate(publishJson);
  if (!causalityLock.passed) {
    return { ok: false, error: causalityLock.headline };
  }

  const hypergraphL10 = evaluateHypergraphL10QuantumResilientAnchorGate(publishJson);
  if (!hypergraphL10.passed) {
    return { ok: false, error: hypergraphL10.headline };
  }

  const neptuneHalo = evaluateNeptuneTritonRetrogradeDtnHaloGate(publishJson);
  if (!neptuneHalo.passed) {
    return { ok: false, error: neptuneHalo.headline };
  }

  const commerceRegistry = evaluateItuUncitralDigitalCommerceAiRegistryGate(publishJson);
  if (!commerceRegistry.passed) {
    return { ok: false, error: commerceRegistry.headline };
  }

  const epochFreeze = evaluateOmniverseEpochFreezeCrdtGate(publishJson);
  if (!epochFreeze.passed) {
    return { ok: false, error: epochFreeze.headline };
  }

  const hypergraphL11 = evaluateHypergraphL11TopologicalFaultTolerantAnchorGate(publishJson);
  if (!hypergraphL11.passed) {
    return { ok: false, error: hypergraphL11.headline };
  }

  const plutoBarycenter = evaluatePlutoCharonBinaryDtnBarycenterGate(publishJson);
  if (!plutoBarycenter.passed) {
    return { ok: false, error: plutoBarycenter.headline };
  }

  const standardsRegistry = evaluateIsoIecAiStandardsHarmonizationRegistryGate(publishJson);
  if (!standardsRegistry.passed) {
    return { ok: false, error: standardsRegistry.headline };
  }

  const timelineSeal = evaluateMultiverseTimelineSealCrdtGate(publishJson);
  if (!timelineSeal.passed) {
    return { ok: false, error: timelineSeal.headline };
  }

  const hypergraphL12 = evaluateHypergraphL12CategoricalQuantumAnchorGate(publishJson);
  if (!hypergraphL12.passed) {
    return { ok: false, error: hypergraphL12.headline };
  }

  const kuiperAphelion = evaluateKuiperScatteredDiskDtnAphelionGate(publishJson);
  if (!kuiperAphelion.passed) {
    return { ok: false, error: kuiperAphelion.headline };
  }

  const governanceRegistry = evaluateCenCenelecDigitalProductGovernanceRegistryGate(publishJson);
  if (!governanceRegistry.passed) {
    return { ok: false, error: governanceRegistry.headline };
  }

  const branchMergeSeal = evaluateMultiverseBranchMergeSealCrdtGate(publishJson);
  if (!branchMergeSeal.passed) {
    return { ok: false, error: branchMergeSeal.headline };
  }

  const hypergraphL13 = evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate(publishJson);
  if (!hypergraphL13.passed) {
    return { ok: false, error: hypergraphL13.headline };
  }

  }

  const blockingSync = experimentsOn ? await countBlockingEdgeSyncJobs(sf.id) : 0;
  if (blockingSync > 0) {
    return {
      ok: false,
      error:
        "Theme experiment is still syncing to edge. Wait about a minute, then publish again.",
    };
  }

  const themeDraft = parseThemeDraft(sf.themeDraftJson);
  const customizer = resolveThemeCustomizer(themeDraft, sf);

  const snapshot = buildThemeSnapshotV1({
    navigationItems: extractNavItemsForSnapshot(sf.navigation?.itemsJson),
    footerBlocks: extractFooterBlocksForSnapshot(sf.footer?.blocksJson),
    tokens: {
      brandColor: customizer.accentColor,
      secondaryColor: customizer.secondaryColor,
      backgroundColor: sf.backgroundColor,
      textColor: sf.textColor,
    },
    customizer,
    customCss: themeDraft.customCss ?? null,
  });

  const publishedAt = new Date();
  const snapshotWithTag = {
    ...(snapshot as object),
    _cacheTag: themeSnapshotCacheTag(sf.id, publishedAt),
  };

  let themeExperimentJson = sf.themeExperimentJson;
  if (isDnaAuditTrailEnabled()) {
    const appended = appendDnaAuditBlock(themeExperimentJson, {
      eventType: "theme_publish",
      payload: { storeSlug: sf.storeSlug, publishedAt: publishedAt.toISOString() },
    });
    themeExperimentJson = coalesceThemeExperimentJson(appended.json);
    if (isPqcDnaArchivalEnabled()) {
      themeExperimentJson = coalesceThemeExperimentJson(
        sealPqcDnaArchivalFromTrail(themeExperimentJson).json,
      );
    }
  }

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: {
      themePublishedJson: snapshotWithTag as object,
      themePublishedAt: publishedAt,
      themePublishedById: params.userId,
      themeDraftJson: snapshotWithTag as object,
      ...(themeExperimentJson !== sf.themeExperimentJson
        ? { themeExperimentJson: themeExperimentJson as object }
        : {}),
    },
  });

  await recordStorefrontThemeVersion({
    storefrontId: sf.id,
    themeJson: snapshotWithTag as Prisma.InputJsonValue,
  });

  const lifecycle = experimentsOn
    ? await concludeThemeExperimentLifecycle({
        storefrontId: sf.id,
        storeSlug: sf.storeSlug,
        themeExperimentJson,
        outcome: "publish_draft",
      })
    : { themeExperimentJson };

  const profile = await prisma.userProfile.findUnique({
    where: { id: params.userId },
    select: { email: true },
  });
  await auditStorefrontThemePublish({
    userId: params.userId,
    email: profile?.email,
    storefrontId: sf.id,
    storeSlug: sf.storeSlug,
  });

  void purgeStorefrontCdnAfterThemePublish({
    storefrontId: sf.id,
    storeSlug: sf.storeSlug,
    themePublishedAt: publishedAt,
    themeExperimentJson: lifecycle.themeExperimentJson,
  });

  if (experimentsOn) {
    const { seedPostPublishGuardForStorefront } = await import(
      "@/services/storefront/experiment-post-publish-guard-service"
    );
    await seedPostPublishGuardForStorefront({
      storefrontId: sf.id,
      themeExperimentJson: lifecycle.themeExperimentJson,
    });

    const { seedPartialRollbackForPublish } = await import(
      "@/services/storefront/experiment-partial-rollback-service"
    );
    await seedPartialRollbackForPublish({
      storefrontId: sf.id,
      themeExperimentJson: lifecycle.themeExperimentJson,
    });
  }

  return { ok: true };
}
