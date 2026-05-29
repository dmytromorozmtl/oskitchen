/**
 * Era 20 — Integration Health trust layer (P0 banner + smoke-honest channel tones).
 */

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildP0OpsVaultUiSlice,
  type P0OpsVaultUiSlice,
} from "@/lib/commercial/p0-ops-vault-ui-era21";
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
): IntegrationHealthP0TrustBanner | null {
  if (!p0Staging) return null;
  if (p0Staging.p0ProofStatus === "proof_passed") return null;

  const opsVault = buildP0OpsVaultUiSlice(p0Staging);
  if (!opsVault) return null;

  const missingEnvVars = p0Staging.allMissingEnvVars;
  const missingCount = missingEnvVars.length;

  return {
    policyId: INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID,
    visible: true,
    p0ProofStatus: p0Staging.p0ProofStatus,
    overall: p0Staging.overall,
    missingEnvVars,
    missingCount,
    headline:
      missingCount >= 11
        ? "P0 staging proof blocked — configure all 11 ops env vars before engineering PASS or LIVE claims."
        : missingCount > 0
          ? `P0 staging proof blocked — ${missingCount} prerequisite env var(s) missing.`
          : "P0 staging proof not passed — review child smoke artifacts.",
    honestyNote:
      "SKIPPED WITH REASON is honest when credentials are missing — never shown as PASS or LIVE.",
    smokeScripts: [
      "npm run smoke:p0-staging-proof-unblock",
      "npm run smoke:enterprise-sso-idp-staging",
      "npm run smoke:staging-workflows-first-green",
      "npm run smoke:woo-shopify-live",
    ],
    nextActions: [
      { label: "Launch Wizard blockers", href: "/dashboard/launch-wizard" },
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
): string {
  const p0Banner = buildIntegrationHealthP0TrustBanner(p0Staging);
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
    ),
    p0Trust: buildIntegrationHealthP0TrustBanner(p0Staging),
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
