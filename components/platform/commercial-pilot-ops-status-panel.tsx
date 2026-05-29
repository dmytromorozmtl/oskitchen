import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCommercialPilotOpsGoLiveBridgeRows,
  resolveCommercialPilotOpsGoNoGoLaunchNextAction,
} from "@/lib/commercial/commercial-pilot-ops-go-live-bridge-era18";
import {
  COMMERCIAL_PILOT_GONOGO_ANCHOR,
  COMMERCIAL_PILOT_OPS_P0_CHECKLIST_DOC,
  COMMERCIAL_PILOT_P0_STAGING_ANCHOR,
} from "@/lib/commercial/commercial-pilot-ops-status-era18-policy";
import {
  buildCommercialPilotOpsGateRows,
  formatCommercialPilotOpsDecisionLabel,
  resolveCommercialPilotOpsDecision,
  type CommercialPilotOpsStatusModel,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { buildP0OpsVaultUiSlice } from "@/lib/commercial/p0-ops-vault-ui-era21";
import { buildTier2GoldenPathUiSlice } from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import { buildCommercialGoClosureUiSlice } from "@/lib/commercial/commercial-go-closure-ui-era21";
import { buildPilotWeek1ExecutionUiSlice } from "@/lib/commercial/pilot-week1-execution-ui-era21";
import { buildMonth2MarketReadinessUiSlice } from "@/lib/commercial/month2-market-readiness-ui-era21";
import { buildScaleReadinessUiSlice } from "@/lib/commercial/scale-readiness-ui-era21";
import { buildSeriesAPartnerExpansionUiSlice } from "@/lib/commercial/series-a-partner-expansion-ui-era21";
import { buildMarketLeaderPositioningUiSlice } from "@/lib/commercial/market-leader-positioning-ui-era21";
import { buildSustainedOperationalExcellenceUiSlice } from "@/lib/commercial/sustained-operational-excellence-ui-era21";
import { buildContinuousImprovementLoopUiSlice } from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import { buildSustainedProductEvolutionUiSlice } from "@/lib/commercial/sustained-product-evolution-ui-era23";
import { buildMaintenanceModeUiSlice } from "@/lib/commercial/maintenance-mode-ui-era24";
import { readMonth2MarketReadinessArtifacts } from "@/scripts/ops/validate-month2-market-readiness-env";
import { readScaleReadinessArtifacts } from "@/scripts/ops/validate-scale-readiness-env";
import { readSeriesAPartnerExpansionArtifacts } from "@/scripts/ops/validate-series-a-partner-expansion-env";
import { readMarketLeaderPositioningArtifacts } from "@/scripts/ops/validate-market-leader-positioning-env";
import { readSustainedOperationalExcellenceArtifacts } from "@/scripts/ops/validate-sustained-operational-excellence-env";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";
import { P0OpsVaultPhasesPanel } from "@/components/dashboard/p0-ops-vault-phases-panel";
import { Tier2GoldenPathPhasesPanel } from "@/components/dashboard/tier2-golden-path-phases-panel";
import { CommercialGoClosurePhasesPanel } from "@/components/dashboard/commercial-go-closure-phases-panel";
import { PilotWeek1PhasesPanel } from "@/components/dashboard/pilot-week1-phases-panel";
import { Month2MarketReadinessPhasesPanel } from "@/components/dashboard/month2-market-readiness-phases-panel";
import { ScaleReadinessPhasesPanel } from "@/components/dashboard/scale-readiness-phases-panel";
import { SeriesAPartnerExpansionPhasesPanel } from "@/components/dashboard/series-a-partner-expansion-phases-panel";
import { MarketLeaderPositioningPhasesPanel } from "@/components/dashboard/market-leader-positioning-phases-panel";
import { SustainedOperationalExcellencePhasesPanel } from "@/components/dashboard/sustained-operational-excellence-phases-panel";
import { ContinuousImprovementLoopPanel } from "@/components/dashboard/continuous-improvement-loop-panel";
import { SustainedProductEvolutionPanel } from "@/components/dashboard/sustained-product-evolution-panel";
import { MaintenanceModePanel } from "@/components/dashboard/maintenance-mode-panel";
import { PureOperationalModeTerminusEra25Strip } from "@/components/dashboard/launch-wizard/pure-operational-mode-terminus-era25-strip";
import { buildPureOperationalModeTerminusEra25UiSlice } from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import { shouldSuppressEra21CommercialPilotGatePanels } from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import type { PlatformGoLiveProjectRow } from "@/lib/go-live/platform-go-live-focus-era18";

function decisionBadgeVariant(
  decision: ReturnType<typeof resolveCommercialPilotOpsDecision>,
): "default" | "destructive" | "secondary" {
  if (decision === "GO") return "default";
  if (decision === "NO-GO") return "destructive";
  return "secondary";
}

export function CommercialPilotOpsStatusPanel(props: {
  model: CommercialPilotOpsStatusModel;
  launchBlockerProjects?: readonly PlatformGoLiveProjectRow[];
}) {
  const decision = resolveCommercialPilotOpsDecision(props.model.goNoGo);
  const gateRows = buildCommercialPilotOpsGateRows(props.model);
  const goNoGo = props.model.goNoGo.summary;
  const p0 = props.model.p0Staging.summary;
  const tier2 = props.model.tier2Staging.summary;
  const p0OpsVault = buildP0OpsVaultUiSlice(p0);
  const tier2GoldenPath = buildTier2GoldenPathUiSlice({
    p0ProofStatus: p0?.p0ProofStatus ?? null,
    tier2Summary: tier2,
  });
  const commercialGoClosure = buildCommercialGoClosureUiSlice({
    p0ProofStatus: p0?.p0ProofStatus ?? null,
    tier2ProofStatus: tier2?.tier2ProofStatus ?? null,
    goNoGoSummary: props.model.goNoGo.summary,
  });
  const pilotWeek1 = buildPilotWeek1ExecutionUiSlice({
    goNoGoSummary: props.model.goNoGo.summary,
    metricsBaseline: null,
    caseStudyDraft: null,
  });
  const month2Artifacts = readMonth2MarketReadinessArtifacts();
  const month2MarketReadiness = buildMonth2MarketReadinessUiSlice({
    goNoGoSummary: props.model.goNoGo.summary,
    metricsBaseline: month2Artifacts.metricsBaseline,
    caseStudyDraft: month2Artifacts.caseStudyDraft,
    investorOnepager: month2Artifacts.investorOnepager,
  });
  const scaleArtifacts = readScaleReadinessArtifacts();
  const scaleReadiness = buildScaleReadinessUiSlice({
    goNoGoSummary: props.model.goNoGo.summary,
    p0Staging: scaleArtifacts.p0Staging ?? p0,
    tier2Summary: scaleArtifacts.tier2Summary ?? tier2,
    metricsBaseline: scaleArtifacts.metricsBaseline ?? month2Artifacts.metricsBaseline,
    caseStudyDraft: scaleArtifacts.caseStudyDraft ?? month2Artifacts.caseStudyDraft,
    investorOnepager: scaleArtifacts.investorOnepager ?? month2Artifacts.investorOnepager,
    rollbackDrill: scaleArtifacts.rollbackDrill,
  });
  const seriesAArtifacts = readSeriesAPartnerExpansionArtifacts();
  const seriesAPartnerExpansion = buildSeriesAPartnerExpansionUiSlice({
    goNoGoSummary: props.model.goNoGo.summary,
    p0Staging: seriesAArtifacts.p0Staging ?? scaleArtifacts.p0Staging ?? p0,
    tier2Summary: seriesAArtifacts.tier2Summary ?? scaleArtifacts.tier2Summary ?? tier2,
    metricsBaseline:
      seriesAArtifacts.metricsBaseline ?? scaleArtifacts.metricsBaseline ?? month2Artifacts.metricsBaseline,
    caseStudyDraft:
      seriesAArtifacts.caseStudyDraft ?? scaleArtifacts.caseStudyDraft ?? month2Artifacts.caseStudyDraft,
    investorOnepager:
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill: seriesAArtifacts.rollbackDrill ?? scaleArtifacts.rollbackDrill,
    competitorMatrix: seriesAArtifacts.competitorMatrix,
  });
  const marketLeaderArtifacts = readMarketLeaderPositioningArtifacts();
  const marketLeaderPositioning = buildMarketLeaderPositioningUiSlice({
    goNoGoSummary: props.model.goNoGo.summary,
    p0Staging:
      marketLeaderArtifacts.p0Staging ?? seriesAArtifacts.p0Staging ?? scaleArtifacts.p0Staging ?? p0,
    tier2Summary:
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      tier2,
    metricsBaseline:
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      marketLeaderArtifacts.rollbackDrill ?? seriesAArtifacts.rollbackDrill ?? scaleArtifacts.rollbackDrill,
    competitorMatrix:
      marketLeaderArtifacts.competitorMatrix ?? seriesAArtifacts.competitorMatrix,
  });
  const sustainedOpsArtifacts = readSustainedOperationalExcellenceArtifacts();
  const sustainedOperationalExcellence = buildSustainedOperationalExcellenceUiSlice({
    goNoGoSummary: props.model.goNoGo.summary,
    p0Staging:
      sustainedOpsArtifacts.p0Staging ??
      marketLeaderArtifacts.p0Staging ??
      seriesAArtifacts.p0Staging ??
      scaleArtifacts.p0Staging ??
      p0,
    tier2Summary:
      sustainedOpsArtifacts.tier2Summary ??
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      tier2,
    metricsBaseline:
      sustainedOpsArtifacts.metricsBaseline ??
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      sustainedOpsArtifacts.caseStudyDraft ??
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      sustainedOpsArtifacts.investorOnepager ??
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      sustainedOpsArtifacts.rollbackDrill ??
      marketLeaderArtifacts.rollbackDrill ??
      seriesAArtifacts.rollbackDrill ??
      scaleArtifacts.rollbackDrill,
    competitorMatrix:
      sustainedOpsArtifacts.competitorMatrix ??
      marketLeaderArtifacts.competitorMatrix ??
      seriesAArtifacts.competitorMatrix,
  });
  const loopArtifacts = readContinuousImprovementLoopArtifacts();
  const continuousImprovementLoop = buildContinuousImprovementLoopUiSlice({
    goNoGoSummary: props.model.goNoGo.summary,
    p0Staging:
      loopArtifacts.p0Staging ??
      sustainedOpsArtifacts.p0Staging ??
      marketLeaderArtifacts.p0Staging ??
      seriesAArtifacts.p0Staging ??
      scaleArtifacts.p0Staging ??
      p0,
    tier2Summary:
      loopArtifacts.tier2Summary ??
      sustainedOpsArtifacts.tier2Summary ??
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      tier2,
    metricsBaseline:
      loopArtifacts.metricsBaseline ??
      sustainedOpsArtifacts.metricsBaseline ??
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      loopArtifacts.caseStudyDraft ??
      sustainedOpsArtifacts.caseStudyDraft ??
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      loopArtifacts.investorOnepager ??
      sustainedOpsArtifacts.investorOnepager ??
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      loopArtifacts.rollbackDrill ??
      sustainedOpsArtifacts.rollbackDrill ??
      marketLeaderArtifacts.rollbackDrill ??
      seriesAArtifacts.rollbackDrill ??
      scaleArtifacts.rollbackDrill,
    competitorMatrix:
      loopArtifacts.competitorMatrix ??
      sustainedOpsArtifacts.competitorMatrix ??
      marketLeaderArtifacts.competitorMatrix ??
      seriesAArtifacts.competitorMatrix,
  });
  const sustainedProductEvolution = buildSustainedProductEvolutionUiSlice({
    goNoGoSummary: props.model.goNoGo.summary,
    p0Staging:
      loopArtifacts.p0Staging ??
      sustainedOpsArtifacts.p0Staging ??
      marketLeaderArtifacts.p0Staging ??
      seriesAArtifacts.p0Staging ??
      scaleArtifacts.p0Staging ??
      p0,
    tier2Summary:
      loopArtifacts.tier2Summary ??
      sustainedOpsArtifacts.tier2Summary ??
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      tier2,
    metricsBaseline:
      loopArtifacts.metricsBaseline ??
      sustainedOpsArtifacts.metricsBaseline ??
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      loopArtifacts.caseStudyDraft ??
      sustainedOpsArtifacts.caseStudyDraft ??
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      loopArtifacts.investorOnepager ??
      sustainedOpsArtifacts.investorOnepager ??
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      loopArtifacts.rollbackDrill ??
      sustainedOpsArtifacts.rollbackDrill ??
      marketLeaderArtifacts.rollbackDrill ??
      seriesAArtifacts.rollbackDrill ??
      scaleArtifacts.rollbackDrill,
    competitorMatrix:
      loopArtifacts.competitorMatrix ??
      sustainedOpsArtifacts.competitorMatrix ??
      marketLeaderArtifacts.competitorMatrix ??
      seriesAArtifacts.competitorMatrix,
  });
  const maintenanceMode = buildMaintenanceModeUiSlice({
    goNoGoSummary: props.model.goNoGo.summary,
    p0Staging:
      loopArtifacts.p0Staging ??
      sustainedOpsArtifacts.p0Staging ??
      marketLeaderArtifacts.p0Staging ??
      seriesAArtifacts.p0Staging ??
      scaleArtifacts.p0Staging ??
      p0,
    tier2Summary:
      loopArtifacts.tier2Summary ??
      sustainedOpsArtifacts.tier2Summary ??
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      tier2,
    metricsBaseline:
      loopArtifacts.metricsBaseline ??
      sustainedOpsArtifacts.metricsBaseline ??
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      loopArtifacts.caseStudyDraft ??
      sustainedOpsArtifacts.caseStudyDraft ??
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      loopArtifacts.investorOnepager ??
      sustainedOpsArtifacts.investorOnepager ??
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      loopArtifacts.rollbackDrill ??
      sustainedOpsArtifacts.rollbackDrill ??
      marketLeaderArtifacts.rollbackDrill ??
      seriesAArtifacts.rollbackDrill ??
      scaleArtifacts.rollbackDrill,
    competitorMatrix:
      loopArtifacts.competitorMatrix ??
      sustainedOpsArtifacts.competitorMatrix ??
      marketLeaderArtifacts.competitorMatrix ??
      seriesAArtifacts.competitorMatrix,
  });
  const pureOperationalModeTerminus = buildPureOperationalModeTerminusEra25UiSlice({
    sustainedOpsConvergenceVisible: true,
  });
  const suppressEra21GatePanels = shouldSuppressEra21CommercialPilotGatePanels({
    pureOperationalModeEra25Active:
      pureOperationalModeTerminus?.pureOperationalModeEra25Active ?? false,
  });
  const launchBlockerCount = props.launchBlockerProjects
    ? buildCommercialPilotOpsGoLiveBridgeRows(props.launchBlockerProjects).length
    : 0;
  const launchNextAction = resolveCommercialPilotOpsGoNoGoLaunchNextAction({
    decision,
    blockerCount: launchBlockerCount,
  });

  return (
    <div className="space-y-6">
      <Card
        id={COMMERCIAL_PILOT_GONOGO_ANCHOR.slice(1)}
        className="scroll-mt-24 border-zinc-800 bg-zinc-900/60"
        data-testid="commercial-pilot-gono-go-panel"
      >
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-white">
            <ClipboardList className="h-5 w-5 text-zinc-400" aria-hidden />
            Pilot GO/NO-GO evaluator
            <Badge variant={decisionBadgeVariant(decision)} className="rounded-full">
              {formatCommercialPilotOpsDecisionLabel(decision)}
            </Badge>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Source: <span className="font-mono text-xs">artifacts/pilot-gono-go-summary.json</span>
            {goNoGo?.runAt ? ` · last run ${new Date(goNoGo.runAt).toLocaleString()}` : ""}
            {!props.model.goNoGo.artifactPresent ? " · artifact not found on this host" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-300">
          {goNoGo?.blockers.length ? (
            <div>
              <p className="mb-2 font-medium text-rose-300">Blockers</p>
              <ul className="list-disc space-y-1 pl-5 text-zinc-400">
                {goNoGo.blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
              {launchNextAction ? (
                <p className="mt-3">
                  <Link href={launchNextAction.href} className="text-sm font-medium text-amber-300 underline-offset-2 hover:underline">
                    {launchNextAction.label}
                  </Link>
                </p>
              ) : null}
            </div>
          ) : launchNextAction ? (
            <p>
              <Link href={launchNextAction.href} className="text-sm font-medium text-amber-300 underline-offset-2 hover:underline">
                {launchNextAction.label}
              </Link>
            </p>
          ) : null}

          {goNoGo?.warnings.length ? (
            <div>
              <p className="mb-2 font-medium text-amber-200">Warnings</p>
              <ul className="list-disc space-y-1 pl-5 text-zinc-400">
                {goNoGo.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {gateRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 pr-4 font-medium">Evidence gate</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Reason</th>
                    <th className="py-2 font-medium">Next</th>
                  </tr>
                </thead>
                <tbody>
                  {gateRows.map((row) => (
                    <tr key={row.id} className="border-b border-zinc-800/60" data-testid={`gate-row-${row.id}`}>
                      <td className="py-2 pr-4 text-zinc-200">{row.label}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={row.pass ? "default" : "destructive"} className="rounded-full text-[10px]">
                          {row.pass ? "PASS" : "FAIL"}
                        </Badge>
                      </td>
                      <td className="max-w-md py-2 pr-4 text-xs text-zinc-500">{row.reason}</td>
                      <td className="py-2">
                        {row.nextAction ? (
                          <Link
                            href={row.nextAction.href}
                            className={
                              row.nextAction.tone === "urgent"
                                ? "font-medium text-amber-300 underline-offset-2 hover:underline"
                                : "text-primary underline-offset-2 hover:underline"
                            }
                          >
                            {row.nextAction.label}
                          </Link>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500">No evidence gates loaded — run smoke:pilot-gono-go.</p>
          )}
        </CardContent>
      </Card>

      <Card
        id={COMMERCIAL_PILOT_P0_STAGING_ANCHOR.slice(1)}
        className="scroll-mt-24 border-zinc-800 bg-zinc-900/60"
        data-testid="commercial-pilot-p0-staging-panel"
      >
        <CardHeader>
          <CardTitle className="text-white">P0 staging proof unblock</CardTitle>
          <CardDescription className="text-zinc-400">
            Source: <span className="font-mono text-xs">artifacts/p0-staging-proof-unblock-summary.json</span>
            {p0?.runAt ? ` · last run ${new Date(p0.runAt).toLocaleString()}` : ""}
            {!props.model.p0Staging.artifactPresent ? " · artifact not found on this host" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-300">
          {p0 ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={p0.p0ProofStatus === "proof_passed" ? "default" : "destructive"}
                  className="rounded-full"
                >
                  {p0.p0ProofStatus.replaceAll("_", " ")}
                </Badge>
                <span className="text-zinc-500">overall {p0.overall}</span>
              </div>

              {p0.allMissingEnvVars.length > 0 ? (
                <div>
                  <p className="mb-2 font-medium text-amber-200">Missing env vars ({p0.allMissingEnvVars.length})</p>
                  <p className="font-mono text-xs text-zinc-500">{p0.allMissingEnvVars.join(", ")}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Ops checklist: {COMMERCIAL_PILOT_OPS_P0_CHECKLIST_DOC}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-3">
                {(
                  [
                    ["ssoIdpStaging", "SSO IdP staging"],
                    ["stagingWorkflowsFirstGreen", "GitHub first green"],
                    ["channelLive", "Woo/Shopify live"],
                  ] as const
                ).map(([key, label]) => {
                  const child = p0.children[key];
                  return (
                    <div key={key} className="rounded-lg border border-zinc-800 p-3">
                      <p className="font-medium text-zinc-200">{label}</p>
                      <p className="mt-1 text-xs text-zinc-500">{child.smokeScript}</p>
                      <p className="mt-2">
                        <Badge
                          variant={child.overall === "PASSED" ? "default" : "secondary"}
                          className="rounded-full text-[10px]"
                        >
                          {child.overall ?? "—"} · {child.proofStatus ?? "—"}
                        </Badge>
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-zinc-500">
              Run <span className="font-mono">npm run smoke:p0-staging-proof-unblock</span> after vault
              credentials are configured.
            </p>
          )}
        </CardContent>
      </Card>

      {p0OpsVault ? <P0OpsVaultPhasesPanel slice={p0OpsVault} variant="platform" /> : null}

      {tier2GoldenPath ? (
        <Tier2GoldenPathPhasesPanel slice={tier2GoldenPath} variant="platform" />
      ) : null}

      {!suppressEra21GatePanels && commercialGoClosure ? (
        <CommercialGoClosurePhasesPanel slice={commercialGoClosure} variant="platform" />
      ) : null}

      {!suppressEra21GatePanels && pilotWeek1 ? (
        <PilotWeek1PhasesPanel slice={pilotWeek1} variant="platform" />
      ) : null}

      {!suppressEra21GatePanels && month2MarketReadiness ? (
        <Month2MarketReadinessPhasesPanel slice={month2MarketReadiness} variant="platform" />
      ) : null}

      {!suppressEra21GatePanels && scaleReadiness ? (
        <ScaleReadinessPhasesPanel slice={scaleReadiness} variant="platform" />
      ) : null}

      {!suppressEra21GatePanels && seriesAPartnerExpansion ? (
        <SeriesAPartnerExpansionPhasesPanel slice={seriesAPartnerExpansion} variant="platform" />
      ) : null}

      {!suppressEra21GatePanels && marketLeaderPositioning ? (
        <MarketLeaderPositioningPhasesPanel slice={marketLeaderPositioning} variant="platform" />
      ) : null}

      {!suppressEra21GatePanels && sustainedOperationalExcellence ? (
        <SustainedOperationalExcellencePhasesPanel
          slice={sustainedOperationalExcellence}
          variant="platform"
        />
      ) : null}

      {pureOperationalModeTerminus ? (
        <div
          id="era25-pure-operational-mode-terminus"
          className="scroll-mt-24"
          data-testid="commercial-pilot-ops-pure-operational-mode-terminus"
        >
          <PureOperationalModeTerminusEra25Strip slice={pureOperationalModeTerminus} />
        </div>
      ) : null}

      {continuousImprovementLoop ? (
        <ContinuousImprovementLoopPanel slice={continuousImprovementLoop} variant="platform" />
      ) : null}

      {sustainedProductEvolution ? (
        <SustainedProductEvolutionPanel slice={sustainedProductEvolution} variant="platform" />
      ) : null}

      {maintenanceMode ? <MaintenanceModePanel slice={maintenanceMode} variant="platform" /> : null}

      <Card className="scroll-mt-24 border-zinc-800 bg-zinc-900/60" data-testid="commercial-pilot-tier2-panel">
        <CardHeader>
          <CardTitle className="text-white">Tier 2 staging golden path</CardTitle>
          <CardDescription className="text-zinc-400">
            Source:{" "}
            <span className="font-mono text-xs">artifacts/tier2-staging-golden-path-summary.json</span>
            {!props.model.tier2Staging.artifactPresent ? " · artifact not found on this host" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-300">
          {tier2 ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={tier2.tier2ProofStatus === "proof_passed" ? "default" : "secondary"}
                  className="rounded-full"
                >
                  {tier2.tier2ProofStatus.replaceAll("_", " ")}
                </Badge>
                <span className="text-zinc-500">overall {tier2.overall}</span>
              </div>
              <p className="text-zinc-400">
                Orchestrator:{" "}
                <span className="font-mono text-xs">npm run smoke:tier2-staging-golden-path</span>
              </p>
              <p>
                <Link href="/dashboard/launch-wizard" className="text-amber-300 underline-offset-2 hover:underline">
                  Open Launch Wizard Tier 2 panel
                </Link>
              </p>
            </>
          ) : (
            <p className="text-zinc-500">
              Run after P0 PASS:{" "}
              <span className="font-mono">npm run smoke:tier2-staging-golden-path</span>
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-zinc-500">
        This panel reads smoke summary artifacts from the repo host. It never upgrades NO-GO to GO and
        does not record customer LOI — use env vars and smoke scripts per era17-pilot-gono-go-v1.
      </p>
    </div>
  );
}
