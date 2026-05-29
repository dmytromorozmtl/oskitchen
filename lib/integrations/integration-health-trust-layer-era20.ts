/**
 * Era 20 — Integration Health trust layer (P0 banner + smoke-honest channel tones).
 */

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildP0OpsVaultUiSlice,
  formatP0OpsVaultTrustBannerHeadline,
  resolveP0OpsVaultNextPhaseSmokeCommands,
  type P0OpsVaultUiSlice,
} from "@/lib/commercial/p0-ops-vault-ui-era21";
import type { VaultReadinessReport } from "@/lib/ops/vault-readiness-report";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type {
  IntegrationHealthChannelCard,
  IntegrationHealthChannelCardStateTone,
  IntegrationHealthChannelCardsModel,
} from "@/lib/integrations/integration-health-channel-cards-era19";
import type { IntegrationHealthSmokeDisplayStatus } from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import {
  buildIntegrationHealthPilotWeek1Banner,
  type IntegrationHealthPilotWeek1Banner,
} from "@/lib/integrations/integration-health-pilot-week1-era21";
import {
  buildIntegrationHealthTier2GoldenPathBanner,
  type IntegrationHealthTier2GoldenPathBanner,
} from "@/lib/integrations/integration-health-tier2-golden-path-era21";
import {
  buildIntegrationHealthCommercialInflectionBanner,
  type IntegrationHealthCommercialInflectionBanner,
} from "@/lib/integrations/integration-health-commercial-inflection-era28";
import { INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID } from "@/lib/integrations/integration-health-trust-layer-era20-policy";

export type IntegrationHealthP0TrustBanner = {
  policyId: typeof INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID;
  visible: boolean;
  p0ProofStatus: string;
  overall: string | null;
  missingEnvVars: readonly string[];
  missingCount: number;
  headline: string;
  honestyNote: string;
  smokeScripts: readonly string[];
  nextActions: readonly { label: string; href: string }[];
  opsVault: P0OpsVaultUiSlice;
};

export function capIntegrationHealthStateToneForSmoke(
  stateTone: IntegrationHealthChannelCardStateTone,
  smokeStatus: IntegrationHealthSmokeDisplayStatus | null,
): IntegrationHealthChannelCardStateTone {
  if (smokeStatus === "FAILED") return "down";
  if (smokeStatus === "SKIPPED WITH REASON" && stateTone === "healthy") return "degraded";
  return stateTone;
}

export function applySmokeHonestyToChannelCard(
  card: IntegrationHealthChannelCard,
): IntegrationHealthChannelCard {
  const stateTone = capIntegrationHealthStateToneForSmoke(card.stateTone, card.smokeStatus);
  if (stateTone === card.stateTone) return card;
  return { ...card, stateTone };
}

export function buildIntegrationHealthP0TrustBanner(
  p0Staging: P0StagingProofUnblockSummary | null,
  vaultReport?: VaultReadinessReport | null,
): IntegrationHealthP0TrustBanner | null {
  if (!p0Staging) return null;
  if (p0Staging.p0ProofStatus === "proof_passed") return null;

  const opsVault = buildP0OpsVaultUiSlice(p0Staging, vaultReport);
  if (!opsVault) return null;

  const missingEnvVars = opsVault.missingEnvVars;
  const missingCount = opsVault.missingCount;

  return {
    policyId: INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID,
    visible: true,
    p0ProofStatus: p0Staging.p0ProofStatus,
    overall: p0Staging.overall,
    missingEnvVars,
    missingCount,
    headline: formatP0OpsVaultTrustBannerHeadline(opsVault),
    honestyNote:
      "SKIPPED WITH REASON is honest when credentials are missing — never shown as PASS or LIVE.",
    smokeScripts: resolveP0OpsVaultNextPhaseSmokeCommands(opsVault),
    nextActions: [
      { label: "VP Ops vault checklist", href: opsVault.platformOpsHref },
      { label: "Launch Wizard blockers", href: opsVault.launchWizardHref },
      { label: "Recovery checklist", href: "/dashboard/integration-health#integration-recovery-checklist" },
    ],
    opsVault,
  };
}

export function buildTrustLayerHeadline(
  p0Staging: P0StagingProofUnblockSummary | null,
  tier2Summary: Tier2StagingGoldenPathSummary | null,
  cardsHeadline: string,
  pilotWeek1Input?: {
    goNoGoSummary: PilotGoNoGoSummary | null;
    metricsBaseline: PilotMetricsBaselineSummary | null;
    caseStudyDraft: PilotCaseStudyDraftSummary | null;
  },
  vaultReport?: VaultReadinessReport | null,
): string {
  const p0Banner = buildIntegrationHealthP0TrustBanner(p0Staging, vaultReport);
  if (p0Banner) return `${p0Banner.headline} ${cardsHeadline}`;
  const inflectionBanner =
    p0Staging?.p0ProofStatus === "proof_passed"
      ? null
      : buildIntegrationHealthCommercialInflectionBanner({
          p0Staging,
          tier2Summary,
        });
  if (inflectionBanner) return `${inflectionBanner.headline} ${cardsHeadline}`;
  const tier2Banner = buildIntegrationHealthTier2GoldenPathBanner({
    p0Staging,
    tier2Summary,
  });
  if (tier2Banner) return `${tier2Banner.headline} ${cardsHeadline}`;
  const week1Banner = pilotWeek1Input
    ? buildIntegrationHealthPilotWeek1Banner({
        goNoGoSummary: pilotWeek1Input.goNoGoSummary,
        p0ProofStatus: p0Staging?.p0ProofStatus ?? null,
        tier2ProofStatus: tier2Summary?.tier2ProofStatus ?? null,
        metricsBaseline: pilotWeek1Input.metricsBaseline,
        caseStudyDraft: pilotWeek1Input.caseStudyDraft,
      })
    : null;
  if (week1Banner) return `${week1Banner.headline} ${cardsHeadline}`;
  return cardsHeadline;
}

export type IntegrationHealthTrustLayerSlice = {
  trustLayerPolicyId: typeof INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID;
  p0Trust: IntegrationHealthP0TrustBanner | null;
  commercialInflection: IntegrationHealthCommercialInflectionBanner | null;
  tier2GoldenPath: IntegrationHealthTier2GoldenPathBanner | null;
  pilotWeek1: IntegrationHealthPilotWeek1Banner | null;
};

export function enrichIntegrationHealthChannelCardsWithTrustLayer(
  model: IntegrationHealthChannelCardsModel,
  p0Staging: P0StagingProofUnblockSummary | null,
  tier2Summary: Tier2StagingGoldenPathSummary | null = null,
  pilotWeek1Input?: {
    goNoGoSummary: PilotGoNoGoSummary | null;
    metricsBaseline: PilotMetricsBaselineSummary | null;
    caseStudyDraft: PilotCaseStudyDraftSummary | null;
  },
  vaultReport?: VaultReadinessReport | null,
): IntegrationHealthChannelCardsModel & IntegrationHealthTrustLayerSlice {
  const cards = model.cards.map(applySmokeHonestyToChannelCard);
  return {
    ...model,
    cards,
    headline: buildTrustLayerHeadline(
      p0Staging,
      tier2Summary,
      summarizeWithSmokeBlocked(cards),
      pilotWeek1Input,
      vaultReport,
    ),
    p0Trust: buildIntegrationHealthP0TrustBanner(p0Staging, vaultReport),
    commercialInflection: buildIntegrationHealthCommercialInflectionBanner({
      p0Staging,
      tier2Summary,
      goNoGoSummary: pilotWeek1Input?.goNoGoSummary,
    }),
    tier2GoldenPath: buildIntegrationHealthTier2GoldenPathBanner({
      p0Staging,
      tier2Summary,
    }),
    pilotWeek1: pilotWeek1Input
      ? buildIntegrationHealthPilotWeek1Banner({
          goNoGoSummary: pilotWeek1Input.goNoGoSummary,
          p0ProofStatus: p0Staging?.p0ProofStatus ?? null,
          tier2ProofStatus: tier2Summary?.tier2ProofStatus ?? null,
          metricsBaseline: pilotWeek1Input.metricsBaseline,
          caseStudyDraft: pilotWeek1Input.caseStudyDraft,
        })
      : null,
    trustLayerPolicyId: INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID,
  };
}

function summarizeWithSmokeBlocked(cards: readonly IntegrationHealthChannelCard[]): string {
  const smokeBlocked = cards.some(
    (c) => c.smokeStatus === "FAILED" || c.smokeStatus === "SKIPPED WITH REASON",
  );
  if (smokeBlocked) {
    return "Channel cards show SKIPPED/FAILED engineering smoke where proof is missing.";
  }
  return "Review each channel card before claiming LIVE integrations.";
}
