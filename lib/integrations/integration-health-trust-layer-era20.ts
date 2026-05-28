/**
 * Era 20 — Integration Health trust layer (P0 banner + smoke-honest channel tones).
 */

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type {
  IntegrationHealthChannelCard,
  IntegrationHealthChannelCardStateTone,
  IntegrationHealthChannelCardsModel,
} from "@/lib/integrations/integration-health-channel-cards-era19";
import type { IntegrationHealthSmokeDisplayStatus } from "@/lib/integrations/integration-health-smoke-artifacts-era19";
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
  };
}

export function buildTrustLayerHeadline(
  p0Staging: P0StagingProofUnblockSummary | null,
  cardsHeadline: string,
): string {
  const banner = buildIntegrationHealthP0TrustBanner(p0Staging);
  if (!banner) return cardsHeadline;
  return `${banner.headline} ${cardsHeadline}`;
}

export type IntegrationHealthTrustLayerSlice = {
  trustLayerPolicyId: typeof INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID;
  p0Trust: IntegrationHealthP0TrustBanner | null;
};

export function enrichIntegrationHealthChannelCardsWithTrustLayer(
  model: IntegrationHealthChannelCardsModel,
  p0Staging: P0StagingProofUnblockSummary | null,
): IntegrationHealthChannelCardsModel & IntegrationHealthTrustLayerSlice {
  const cards = model.cards.map(applySmokeHonestyToChannelCard);
  return {
    ...model,
    cards,
    headline: buildTrustLayerHeadline(p0Staging, summarizeWithSmokeBlocked(cards)),
    p0Trust: buildIntegrationHealthP0TrustBanner(p0Staging),
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
