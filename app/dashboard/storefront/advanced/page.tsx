import Link from "next/link";

import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { prisma } from "@/lib/prisma";
import { getExperimentEnableCooldownBlock } from "@/lib/storefront/theme-experiment-cooldown";
import { parseExperimentDaysParam } from "@/lib/storefront/parse-experiment-days";
import { isThemeExperimentEdgeEnabled } from "@/lib/storefront/theme-experiment-edge-config";
import { isThemeExperimentEdgeStrict } from "@/lib/storefront/theme-experiment-edge-strict";
import { evaluateExperimentSrm } from "@/lib/storefront/theme-experiment-srm";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { updateStorefrontThemeExperimentFormAction } from "@/actions/storefront-settings";
import { ThemeExperimentCharts } from "@/components/dashboard/storefront/theme-experiment-charts";
import { ThemeExperimentEdgeSyncJobsTable } from "@/components/dashboard/storefront/theme-experiment-edge-sync-jobs-table";
import { ThemeExperimentEdgeSyncStatus } from "@/components/dashboard/storefront/theme-experiment-edge-sync-status";
import { ThemeExperimentDecisionCard } from "@/components/dashboard/storefront/theme-experiment-decision-card";
import { ThemeExperimentLiftCard } from "@/components/dashboard/storefront/theme-experiment-lift-card";
import { ThemeExperimentMetrics } from "@/components/dashboard/storefront/theme-experiment-metrics";
import { ThemeExperimentSrmCard } from "@/components/dashboard/storefront/theme-experiment-srm-card";
import { evaluateExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import { estimateMinCheckoutsPerArm } from "@/lib/storefront/theme-experiment-power";
import { ThemeExperimentPowerCard } from "@/components/dashboard/storefront/theme-experiment-power-card";
import { ThemeExperimentBanditCard } from "@/components/dashboard/storefront/theme-experiment-bandit-card";
import { ThemeExperimentContextualBanditCard } from "@/components/dashboard/storefront/theme-experiment-contextual-bandit-card";
import { ThemeExperimentLinUcbCard } from "@/components/dashboard/storefront/theme-experiment-linucb-card";
import { ThemeExperimentCausalForestCard } from "@/components/dashboard/storefront/theme-experiment-causal-forest-card";
import { ThemeExperimentFeatureStreamCard } from "@/components/dashboard/storefront/theme-experiment-feature-stream-card";
import { ThemeExperimentPostPublishGuardCard } from "@/components/dashboard/storefront/theme-experiment-post-publish-guard-card";
import { ThemeExperimentCausalDagCard } from "@/components/dashboard/storefront/theme-experiment-causal-dag-card";
import { ThemeExperimentFeatureStreamDurableCard } from "@/components/dashboard/storefront/theme-experiment-feature-stream-durable-card";
import { ThemeExperimentPlanetEdgeCard } from "@/components/dashboard/storefront/theme-experiment-planet-edge-card";
import { ThemeExperimentPartialRollbackCard } from "@/components/dashboard/storefront/theme-experiment-partial-rollback-card";
import { ThemeExperimentInterferenceMatrixCard } from "@/components/dashboard/storefront/theme-experiment-interference-matrix-card";
import { ThemeExperimentWasmAssignmentCard } from "@/components/dashboard/storefront/theme-experiment-wasm-assignment-card";
import { ThemeExperimentCausalPosteriorsCard } from "@/components/dashboard/storefront/theme-experiment-causal-posteriors-card";
import { ThemeExperimentFederatedLearningCard } from "@/components/dashboard/storefront/theme-experiment-federated-learning-card";
import { ThemeExperimentEbpfTelemetryCard } from "@/components/dashboard/storefront/theme-experiment-ebpf-telemetry-card";
import { ThemeExperimentCompositionalUiCard } from "@/components/dashboard/storefront/theme-experiment-compositional-ui-card";
import { ThemeExperimentQuantumSafeCard } from "@/components/dashboard/storefront/theme-experiment-quantum-safe-card";
import { ThemeExperimentHoldoutWsCard } from "@/components/dashboard/storefront/theme-experiment-holdout-ws-card";
import { ThemeExperimentAutonomousScientistCard } from "@/components/dashboard/storefront/theme-experiment-autonomous-scientist-card";
import { ThemeExperimentHomomorphicMetricsCard } from "@/components/dashboard/storefront/theme-experiment-homomorphic-metrics-card";
import { ThemeExperimentQuboBanditCard } from "@/components/dashboard/storefront/theme-experiment-qubo-bandit-card";
import { ThemeExperimentCausalDiscoveryCard } from "@/components/dashboard/storefront/theme-experiment-causal-discovery-card";
import { ThemeExperimentZkFairnessCard } from "@/components/dashboard/storefront/theme-experiment-zk-fairness-card";
import { ThemeExperimentNeuromorphicCard } from "@/components/dashboard/storefront/theme-experiment-neuromorphic-card";
import { ThemeExperimentMultiAgentCard } from "@/components/dashboard/storefront/theme-experiment-multi-agent-card";
import { ThemeExperimentTeeAssignCard } from "@/components/dashboard/storefront/theme-experiment-tee-assign-card";
import { ThemeExperimentPhotonicAssignCard } from "@/components/dashboard/storefront/theme-experiment-photonic-assign-card";
import { ThemeExperimentGlobalMeshCard } from "@/components/dashboard/storefront/theme-experiment-global-mesh-card";
import { ThemeExperimentDnaAuditCard } from "@/components/dashboard/storefront/theme-experiment-dna-audit-card";
import { ThemeExperimentBioNeuronCard } from "@/components/dashboard/storefront/theme-experiment-bio-neuron-card";
import { ThemeExperimentDtnMeshCard } from "@/components/dashboard/storefront/theme-experiment-dtn-mesh-card";
import { ThemeExperimentPqcDnaCard } from "@/components/dashboard/storefront/theme-experiment-pqc-dna-card";
import { ThemeExperimentWetwareCalibrationCard } from "@/components/dashboard/storefront/theme-experiment-wetware-calibration-card";
import { ThemeExperimentCislunarDtnCard } from "@/components/dashboard/storefront/theme-experiment-cislunar-dtn-card";
import { ThemeExperimentHomomorphicDnaCard } from "@/components/dashboard/storefront/theme-experiment-homomorphic-dna-card";
import { ThemeExperimentOrganoidWetwareCard } from "@/components/dashboard/storefront/theme-experiment-organoid-wetware-card";
import { ThemeExperimentHeliopauseDtnCard } from "@/components/dashboard/storefront/theme-experiment-heliopause-dtn-card";
import { ThemeExperimentZkDnaRollupCard } from "@/components/dashboard/storefront/theme-experiment-zk-dna-rollup-card";
import { ThemeExperimentCorticalOrganoidMeshCard } from "@/components/dashboard/storefront/theme-experiment-cortical-organoid-mesh-card";
import { ThemeExperimentGalacticMeshCard } from "@/components/dashboard/storefront/theme-experiment-galactic-mesh-card";
import { ThemeExperimentRecursiveZkDnaCard } from "@/components/dashboard/storefront/theme-experiment-recursive-zk-dna-card";
import { ThemeExperimentHippocampalOrganoidMeshCard } from "@/components/dashboard/storefront/theme-experiment-hippocampal-organoid-mesh-card";
import { ThemeExperimentIntergalacticMeshCard } from "@/components/dashboard/storefront/theme-experiment-intergalactic-mesh-card";
import { ThemeExperimentHypergraphZkDnaCard } from "@/components/dashboard/storefront/theme-experiment-hypergraph-zk-dna-card";
import { ThemeExperimentPrefrontalOrganoidMeshCard } from "@/components/dashboard/storefront/theme-experiment-prefrontal-organoid-mesh-card";
import { IndoPacificCompactCard } from "@/components/dashboard/compliance/indo-pacific-compact-card";
import { EuAiActLiveRegistryCard } from "@/components/dashboard/compliance/eu-ai-act-live-registry-card";
import { ThemeExperimentCosmicWebFederationCard } from "@/components/dashboard/storefront/theme-experiment-cosmic-web-federation-card";
import { ThemeExperimentHypergraphEvolutionCard } from "@/components/dashboard/storefront/theme-experiment-hypergraph-evolution-card";
import { ThemeExperimentPrefrontalEthicsBoardCard } from "@/components/dashboard/storefront/theme-experiment-prefrontal-ethics-board-card";
import { ThemeExperimentPanPacificQuantumMeshCard } from "@/components/dashboard/storefront/theme-experiment-pan-pacific-quantum-mesh-card";
import { UkDsitAlgorithmicTransparencyCard } from "@/components/dashboard/compliance/uk-dsit-algorithmic-transparency-card";
import { ThemeExperimentMultiverseOutcomeCrdtCard } from "@/components/dashboard/storefront/theme-experiment-multiverse-outcome-crdt-card";
import { ThemeExperimentHypergraphL3Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l3-card";
import { ThemeExperimentCerebellarMotorOrganoidCard } from "@/components/dashboard/storefront/theme-experiment-cerebellar-motor-organoid-card";
import { ThemeExperimentArcticQuantumMeshCard } from "@/components/dashboard/storefront/theme-experiment-arctic-quantum-mesh-card";
import { ThemeExperimentOmniverseCausalGraphCrdtCard } from "@/components/dashboard/storefront/theme-experiment-omniverse-causal-graph-crdt-card";
import { ThemeExperimentHypergraphL4Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l4-card";
import { ThemeExperimentBrainstemAutonomicGuardCard } from "@/components/dashboard/storefront/theme-experiment-brainstem-autonomic-guard-card";
import { NistAiRmfLiveControlFeedCard } from "@/components/dashboard/compliance/nist-ai-rmf-live-control-feed-card";
import { ThemeExperimentAntarcticSubglacialMeshCard } from "@/components/dashboard/storefront/theme-experiment-antarctic-subglacial-mesh-card";
import { EuAiActArt71PmmLiveCard } from "@/components/dashboard/compliance/eu-ai-act-art71-pmm-live-card";
import { ThemeExperimentMultiverseCounterfactualCrdtCard } from "@/components/dashboard/storefront/theme-experiment-multiverse-counterfactual-crdt-card";
import { ThemeExperimentHypergraphL5Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l5-card";
import { ThemeExperimentSpinalCordPublishThrottleCard } from "@/components/dashboard/storefront/theme-experiment-spinal-cord-publish-throttle-card";
import { ThemeExperimentLunarFarsideDtnMeshCard } from "@/components/dashboard/storefront/theme-experiment-lunar-farside-dtn-mesh-card";
import { UsFtcAiTransparencyLiveCard } from "@/components/dashboard/compliance/us-ftc-ai-transparency-live-card";
import { ThemeExperimentParallelUniverseMergeCrdtCard } from "@/components/dashboard/storefront/theme-experiment-parallel-universe-merge-crdt-card";
import { ThemeExperimentHypergraphL6Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l6-card";
import { ThemeExperimentMedullaOblongataEmergencyHaltCard } from "@/components/dashboard/storefront/theme-experiment-medulla-oblongata-emergency-halt-card";
import { ThemeExperimentMartianOrbitalDtnRelayCard } from "@/components/dashboard/storefront/theme-experiment-martian-orbital-dtn-relay-card";
import { OecdStateAgAiTransparencyMeshCard } from "@/components/dashboard/compliance/oecd-state-ag-ai-transparency-mesh-card";
import { ThemeExperimentMultiverseReconciliationCrdtCard } from "@/components/dashboard/storefront/theme-experiment-multiverse-reconciliation-crdt-card";
import { ThemeExperimentHypergraphL7Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l7-card";
import { ThemeExperimentPonsAutonomicBridgeFailoverCard } from "@/components/dashboard/storefront/theme-experiment-pons-autonomic-bridge-failover-card";
import { ThemeExperimentJupiterTrojanDtnLagrangeCard } from "@/components/dashboard/storefront/theme-experiment-jupiter-trojan-dtn-lagrange-card";
import { UnAiOfficeGlobalRegistryMeshCard } from "@/components/dashboard/compliance/un-ai-office-global-registry-mesh-card";
import { ThemeExperimentOmniverseEpochSealCrdtCard } from "@/components/dashboard/storefront/theme-experiment-omniverse-epoch-seal-crdt-card";
import { ThemeExperimentHypergraphL8Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l8-card";
import { ThemeExperimentMidbrainArousalPublishPacingCard } from "@/components/dashboard/storefront/theme-experiment-midbrain-arousal-publish-pacing-card";
import { ThemeExperimentSaturnRingDtnShepherdCard } from "@/components/dashboard/storefront/theme-experiment-saturn-ring-dtn-shepherd-card";
import { IcaoImoAiAviationRegistryCard } from "@/components/dashboard/compliance/icao-imo-ai-aviation-registry-card";
import { ThemeExperimentMetaverseFinalitySealCrdtCard } from "@/components/dashboard/storefront/theme-experiment-metaverse-finality-seal-crdt-card";
import { ThemeExperimentHypergraphL9Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l9-card";
import { ThemeExperimentThalamusSensoryGatingPublishCard } from "@/components/dashboard/storefront/theme-experiment-thalamus-sensory-gating-publish-card";
import { ThemeExperimentUranusObliquityDtnPolarRelayCard } from "@/components/dashboard/storefront/theme-experiment-uranus-obliquity-dtn-polar-relay-card";
import { WtoUpuCrossBorderAiTradeRegistryCard } from "@/components/dashboard/compliance/wto-upu-cross-border-ai-trade-registry-card";
import { ThemeExperimentMultiverseCausalityLockCrdtCard } from "@/components/dashboard/storefront/theme-experiment-multiverse-causality-lock-crdt-card";
import { ThemeExperimentHypergraphL10Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l10-card";
import { ThemeExperimentBasalGangliaActionSelectionPublishCard } from "@/components/dashboard/storefront/theme-experiment-basal-ganglia-action-selection-publish-card";
import { ThemeExperimentNeptuneTritonRetrogradeDtnHaloCard } from "@/components/dashboard/storefront/theme-experiment-neptune-triton-retrograde-dtn-halo-card";
import { ItuUncitralDigitalCommerceAiRegistryCard } from "@/components/dashboard/compliance/itu-uncitral-digital-commerce-ai-registry-card";
import { ThemeExperimentOmniverseEpochFreezeCrdtCard } from "@/components/dashboard/storefront/theme-experiment-omniverse-epoch-freeze-crdt-card";
import { ThemeExperimentHypergraphL11Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l11-card";
import { ThemeExperimentCerebellumMotorRefinementPublishCard } from "@/components/dashboard/storefront/theme-experiment-cerebellum-motor-refinement-publish-card";
import { ThemeExperimentPlutoCharonBinaryDtnBarycenterCard } from "@/components/dashboard/storefront/theme-experiment-pluto-charon-binary-dtn-barycenter-card";
import { IsoIecAiStandardsHarmonizationRegistryCard } from "@/components/dashboard/compliance/iso-iec-ai-standards-harmonization-registry-card";
import { ThemeExperimentMultiverseTimelineSealCrdtCard } from "@/components/dashboard/storefront/theme-experiment-multiverse-timeline-seal-crdt-card";
import { ThemeExperimentHypergraphL12Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l12-card";
import { ThemeExperimentMotorCortexExecutionPublishCard } from "@/components/dashboard/storefront/theme-experiment-motor-cortex-execution-publish-card";
import { ThemeExperimentKuiperScatteredDiskDtnAphelionCard } from "@/components/dashboard/storefront/theme-experiment-kuiper-scattered-disk-dtn-aphelion-card";
import { CenCenelecDigitalProductGovernanceRegistryCard } from "@/components/dashboard/compliance/cen-cenelec-digital-product-governance-registry-card";
import { ThemeExperimentMultiverseBranchMergeSealCrdtCard } from "@/components/dashboard/storefront/theme-experiment-multiverse-branch-merge-seal-crdt-card";
import { ThemeExperimentHypergraphL13Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l13-card";
import { ThemeExperimentPremotorSmaPlanningPublishCard } from "@/components/dashboard/storefront/theme-experiment-premotor-sma-planning-publish-card";
import { ThemeExperimentBayesianCard } from "@/components/dashboard/storefront/theme-experiment-bayesian-card";
import { buildGa4ParityChecklist } from "@/lib/storefront/ga4-parity";
import { isExperimentPipelineEnabledInJson } from "@/lib/storefront/theme-experiment-pipeline";
import { getThemeExperimentVersion, parseThemeExperimentStored } from "@/lib/storefront/theme-experiment-version";
import { getGa4ParityScoreForStorefront } from "@/services/storefront/ga4-parity-service";
import {
  getThemeExperimentArmMetrics,
  getThemeExperimentDailySeries,
} from "@/services/storefront/theme-experiment-analytics-service";
import { listRecentThemeExperimentEdgeSyncJobs } from "@/services/storefront/storefront-edge-sync-job-history";
import { countBlockingEdgeSyncJobs } from "@/services/storefront/storefront-edge-sync-job-service";
import { listStorefrontExperimentAuditEvents } from "@/services/storefront/storefront-experiment-audit-list";
import { getThemeExperimentEdgeSyncDashboardStatus } from "@/services/storefront/theme-experiment-edge-sync-status";
import { ThemeExperimentAuditTable } from "@/components/dashboard/storefront/theme-experiment-audit-table";
import { ThemeExperimentEdgeSloCard } from "@/components/dashboard/storefront/theme-experiment-edge-slo-card";
import { ThemeExperimentGa4ParityBudgetCard } from "@/components/dashboard/storefront/theme-experiment-ga4-parity-budget-card";
import { ThemeExperimentGa4ParityCard } from "@/components/dashboard/storefront/theme-experiment-ga4-parity-card";
import { ThemeExperimentOpsGuide } from "@/components/dashboard/storefront/theme-experiment-ops-guide";
import { computeEdgeSyncSlo } from "@/services/storefront/storefront-edge-sync-slo-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAY_OPTIONS = [7, 14, 30] as const;

export default async function StorefrontAdvancedPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; refreshGa4?: string }>;
}) {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const sp = await searchParams;
  const experimentDays = parseExperimentDaysParam(sp.days);
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: pageAccess.access.storefront.id },
  });
  const exp = parseThemeExperimentConfig(sf?.themeExperimentJson);
  const stored = sf ? parseThemeExperimentStored(sf.themeExperimentJson) : null;
  const pipelineOn = sf ? isExperimentPipelineEnabledInJson(sf.themeExperimentJson) : true;
  const edgeOn = isThemeExperimentEdgeEnabled();
  const edgeStrict = isThemeExperimentEdgeStrict();
  const cooldownBlock = sf ? getExperimentEnableCooldownBlock(sf.themeExperimentJson, true) : null;

  const [armMetrics, experimentDaily, edgeSyncJobs, edgeSyncBlocking, experimentAudit] = sf
    ? await Promise.all([
        getThemeExperimentArmMetrics(sf.id, experimentDays, sf.themeExperimentJson),
        getThemeExperimentDailySeries(sf.id, experimentDays),
        listRecentThemeExperimentEdgeSyncJobs(sf.id, 10),
        countBlockingEdgeSyncJobs(sf.id),
        listStorefrontExperimentAuditEvents({
          storefrontId: sf.id,
          storeSlug: sf.storeSlug,
          limit: 15,
        }),
      ])
    : [[], [], [], 0, []];

  const prodDecision = evaluateExperimentProdDecision(armMetrics, undefined, {
    themeExperimentJson: sf?.themeExperimentJson,
  });
  const srm = evaluateExperimentSrm(armMetrics, exp?.trafficPercent ?? 50);
  const publishedRate =
    armMetrics.find((r) => r.arm === "published")?.conversionRatePercent ??
    armMetrics[0]?.conversionRatePercent ??
    3;
  const power = estimateMinCheckoutsPerArm({
    baselineRatePercent: publishedRate,
    targetLiftPp: 2,
    power: 0.8,
  });
  const cupedEnabled = process.env.THEME_EXPERIMENT_CUPED === "1";
  const ga4Parity = buildGa4ParityChecklist({
    days: experimentDays,
    decision: prodDecision,
    ga4MeasurementId: sf?.googleAnalyticsId ?? null,
  });
  const ga4Ctx = sf
    ? await getGa4ParityScoreForStorefront({
        storefrontId: sf.id,
        themeExperimentJson: sf.themeExperimentJson,
        googleAnalyticsPropertyId: sf.googleAnalyticsPropertyId,
        days: experimentDays,
        refresh: sp.refreshGa4 === "1",
      })
    : null;
  const edgeSyncSlo = sf ? await computeEdgeSyncSlo({ storefrontId: sf.id }) : null;
  const experimentVersion = sf ? getThemeExperimentVersion(sf.themeExperimentJson) : 0;
  const edgeSyncStatus = sf
    ? await getThemeExperimentEdgeSyncDashboardStatus({
        storefrontId: sf.id,
        storeSlug: sf.storeSlug,
        themeExperimentJson: sf.themeExperimentJson,
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Advanced</h1>
        <p className="mt-2 text-muted-foreground">Platform experiments and cache-oriented settings.</p>
      </div>

      {sf ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>A/B theme experiment</CardTitle>
            <CardDescription>
              Assigns <code className="rounded bg-muted px-1 text-xs">kos_ab_theme</code> cookie — draft
              theme tokens for a percentage of guests.
              <span className="mt-2 block text-xs text-muted-foreground">
                DB experiment version: <strong>{experimentVersion}</strong> (must match Edge Config before arm CDN
                purge).
              </span>
              {edgeOn ? (
                <span className="mt-2 block text-xs">
                  Edge assignment active (<code className="rounded bg-muted px-1">THEME_EXPERIMENT_EDGE</code>
                  ). Config syncs via outbox + cron{" "}
                  <code className="rounded bg-muted px-1">/api/cron/storefront-edge-sync</code>.
                  {edgeStrict ? (
                    <span className="block text-amber-700 dark:text-amber-400">
                      Strict edge sync: saves fail if Edge PATCH does not verify (production default).
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="mt-2 block text-xs">
                  App assigner only. Set <code className="rounded bg-muted px-1">THEME_EXPERIMENT_EDGE=1</code>{" "}
                  and link Edge Config on Vercel for middleware assignment.
                </span>
              )}
              {cooldownBlock && !exp?.enabled ? (
                <span className="mt-2 block text-xs text-amber-700 dark:text-amber-400">
                  {cooldownBlock.message}
                </span>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {edgeSyncStatus ? <ThemeExperimentEdgeSyncStatus status={edgeSyncStatus} /> : null}
            <div>
              <p className="mb-2 text-sm font-medium">Edge sync job history</p>
              <ThemeExperimentEdgeSyncJobsTable jobs={edgeSyncJobs} />
            </div>
            <form action={updateStorefrontThemeExperimentFormAction} className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="experimentEnabled"
                  value="on"
                  defaultChecked={exp?.enabled === true}
                  disabled={Boolean(cooldownBlock && !exp?.enabled)}
                />
                Enable experiment
              </label>
              <input type="hidden" name="pipelineEnabled" value="off" />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="pipelineEnabled"
                  value="on"
                  defaultChecked={pipelineOn}
                />
                Experiment pipeline (edge + alerts) — off = instant kill without redeploy
              </label>
              <div className="space-y-2">
                <Label htmlFor="trafficPercent">Draft traffic %</Label>
                <Input
                  id="trafficPercent"
                  name="trafficPercent"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={exp?.trafficPercent ?? 50}
                  className="rounded-xl w-32"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="draftPresetId">Draft preset id (optional)</Label>
                <Input
                  id="draftPresetId"
                  name="draftPresetId"
                  defaultValue={exp?.draftPresetId ?? ""}
                  placeholder="modern_minimal"
                  className="rounded-xl font-mono text-sm"
                />
              </div>
              <Button type="submit" className="rounded-full">
                Save experiment
              </Button>
            </form>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Experiment audit log</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full h-8">
                    <a href="/api/dashboard/storefront/experiment-audit-export?days=90">
                      Export audit CSV (90d)
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full h-8">
                    <a href="/api/dashboard/storefront/experiment-audit-export?days=90&signed=1">
                      Signed export
                    </a>
                  </Button>
                </div>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                Compliance filter: actions <code className="rounded bg-muted px-1">storefront.experiment.*</code>
              </p>
              <ThemeExperimentAuditTable rows={experimentAudit} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {sf ? <ThemeExperimentOpsGuide /> : null}

      {sf && exp?.enabled ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {DAY_OPTIONS.map((d) => (
                <Button
                  key={d}
                  asChild
                  variant={experimentDays === d ? "secondary" : "outline"}
                  size="sm"
                  className="rounded-full"
                >
                  <Link href={`/dashboard/storefront/advanced?days=${d}`}>{d}d</Link>
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <a href={`/api/dashboard/storefront/experiment-series?days=${experimentDays}`}>
                  Export CSV
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={`/dashboard/storefront/advanced?days=${experimentDays}&refreshGa4=1`}>
                  Refresh GA4 parity
                </Link>
              </Button>
            </div>
          </div>

          <ThemeExperimentSrmCard srm={srm} days={experimentDays} />

          {edgeSyncSlo ? <ThemeExperimentEdgeSloCard slo={edgeSyncSlo} /> : null}

          {ga4Ctx ? (
            <>
              <ThemeExperimentGa4ParityCard
                parity={ga4Parity}
                score={ga4Ctx.score}
                history={ga4Ctx.history}
              />
              <ThemeExperimentGa4ParityBudgetCard budget={ga4Ctx.budget} />
            </>
          ) : null}

          <ThemeExperimentLiftCard rows={armMetrics} days={experimentDays} />

          <ThemeExperimentDecisionCard
            decision={prodDecision}
            days={experimentDays}
            googleAnalyticsId={sf.googleAnalyticsId}
            experimentEnabled={exp?.enabled === true}
            csvExportHref={`/api/dashboard/storefront/experiment-series?days=${experimentDays}`}
            edgeSyncBlocking={edgeSyncBlocking > 0}
          />

          <ThemeExperimentPowerCard power={power} cupedEnabled={cupedEnabled} />

          <ThemeExperimentBayesianCard
            armMetrics={armMetrics}
            themeExperimentJson={sf.themeExperimentJson}
          />

          <ThemeExperimentBanditCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentContextualBanditCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentLinUcbCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentFeatureStreamCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCausalForestCard
            themeExperimentJson={sf.themeExperimentJson}
            globalLiftPp={prodDecision.liftPp}
          />

          <ThemeExperimentPostPublishGuardCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCausalDagCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentFeatureStreamDurableCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPartialRollbackCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPlanetEdgeCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentInterferenceMatrixCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentWasmAssignmentCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCausalPosteriorsCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentFederatedLearningCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentEbpfTelemetryCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCompositionalUiCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentQuantumSafeCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHoldoutWsCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentAutonomousScientistCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHomomorphicMetricsCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentQuboBanditCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCausalDiscoveryCard
            themeExperimentJson={sf.themeExperimentJson}
            storefrontId={sf.id}
          />

          <ThemeExperimentZkFairnessCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentNeuromorphicCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMultiAgentCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentTeeAssignCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPhotonicAssignCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentGlobalMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentDnaAuditCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentBioNeuronCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentDtnMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPqcDnaCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentWetwareCalibrationCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCislunarDtnCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHomomorphicDnaCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentOrganoidWetwareCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHeliopauseDtnCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentZkDnaRollupCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCorticalOrganoidMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentGalacticMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentRecursiveZkDnaCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHippocampalOrganoidMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentIntergalacticMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphZkDnaCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPrefrontalOrganoidMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <IndoPacificCompactCard themeExperimentJson={sf.themeExperimentJson} />

          <EuAiActLiveRegistryCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCosmicWebFederationCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphEvolutionCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPrefrontalEthicsBoardCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPanPacificQuantumMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <UkDsitAlgorithmicTransparencyCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMultiverseOutcomeCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL3Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCerebellarMotorOrganoidCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentArcticQuantumMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <NistAiRmfLiveControlFeedCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentOmniverseCausalGraphCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL4Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentBrainstemAutonomicGuardCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentAntarcticSubglacialMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <EuAiActArt71PmmLiveCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMultiverseCounterfactualCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL5Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentSpinalCordPublishThrottleCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentLunarFarsideDtnMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <UsFtcAiTransparencyLiveCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentParallelUniverseMergeCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL6Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMedullaOblongataEmergencyHaltCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMartianOrbitalDtnRelayCard themeExperimentJson={sf.themeExperimentJson} />

          <OecdStateAgAiTransparencyMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMultiverseReconciliationCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL7Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPonsAutonomicBridgeFailoverCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentJupiterTrojanDtnLagrangeCard themeExperimentJson={sf.themeExperimentJson} />

          <UnAiOfficeGlobalRegistryMeshCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentOmniverseEpochSealCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL8Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMidbrainArousalPublishPacingCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentSaturnRingDtnShepherdCard themeExperimentJson={sf.themeExperimentJson} />

          <IcaoImoAiAviationRegistryCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMetaverseFinalitySealCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL9Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentThalamusSensoryGatingPublishCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentUranusObliquityDtnPolarRelayCard themeExperimentJson={sf.themeExperimentJson} />

          <WtoUpuCrossBorderAiTradeRegistryCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMultiverseCausalityLockCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL10Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentBasalGangliaActionSelectionPublishCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentNeptuneTritonRetrogradeDtnHaloCard themeExperimentJson={sf.themeExperimentJson} />

          <ItuUncitralDigitalCommerceAiRegistryCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentOmniverseEpochFreezeCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL11Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentCerebellumMotorRefinementPublishCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPlutoCharonBinaryDtnBarycenterCard themeExperimentJson={sf.themeExperimentJson} />

          <IsoIecAiStandardsHarmonizationRegistryCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMultiverseTimelineSealCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL12Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMotorCortexExecutionPublishCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentKuiperScatteredDiskDtnAphelionCard themeExperimentJson={sf.themeExperimentJson} />

          <CenCenelecDigitalProductGovernanceRegistryCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentMultiverseBranchMergeSealCrdtCard themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentHypergraphL13Card themeExperimentJson={sf.themeExperimentJson} />

          <ThemeExperimentPremotorSmaPlanningPublishCard themeExperimentJson={sf.themeExperimentJson} />

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Experiment conversion ({experimentDays}d)</CardTitle>
              <CardDescription>
                By <code className="rounded bg-muted px-1 text-xs">kos_ab_theme</code> — exposures and
                checkout funnel. Page views and theme_apply include{" "}
                <code className="rounded bg-muted px-1 text-xs">experimentArm</code> when analytics is on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <ThemeExperimentMetrics rows={armMetrics} />
              <ThemeExperimentCharts data={experimentDaily} days={experimentDays} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
