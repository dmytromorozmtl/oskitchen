/**
 * Order Hub — commercial pilot ops strip (vault phased guidance for channel order flow).
 */
import type { CommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { buildCommercialPilotOpsInflectionSlice } from "@/lib/commercial/commercial-pilot-ops-inflection-era28";
import { INTEGRATION_HEALTH_RECOVERY_ANCHOR } from "@/lib/integrations/integration-health-recovery-era19-policy";

export const ORDER_HUB_COMMERCIAL_OPS_ERA28_POLICY_ID =
  "era28-order-hub-commercial-ops-v1" as const;

export type OrderHubCommercialOpsStripSlice = {
  policyId: typeof ORDER_HUB_COMMERCIAL_OPS_ERA28_POLICY_ID;
  visible: boolean;
  headline: string;
  detail: string;
  p0ProofStatus: string;
  vaultMissingCount: number;
  topBlockerTitle: string;
  vaultPhaseLabel: string | null;
  missingKeys: readonly string[];
  docPath: string | null;
  platformOpsHref: string;
  integrationHealthHref: string;
  channelLiveProofBlocked: boolean;
};

export function buildOrderHubCommercialOpsStripSlice(
  commercialOps: CommercialPilotOpsStatusModel | null | undefined,
): OrderHubCommercialOpsStripSlice | null {
  if (!commercialOps) return null;

  const inflection = buildCommercialPilotOpsInflectionSlice(commercialOps);
  const uiSlice = inflection.uiSlice;
  if (!uiSlice) return null;

  const p0 = commercialOps.p0Staging.summary;
  const vaultHero = inflection.vaultHero;
  const nextPhase = vaultHero?.nextPhase ?? null;
  const channelProof = p0?.children?.channelLive?.proofStatus ?? null;
  const channelLiveProofBlocked =
    p0?.p0ProofStatus !== "proof_passed" &&
    (!channelProof ||
      channelProof.includes("proof_failed") ||
      channelProof.includes("proof_skipped"));

  const headline =
    nextPhase && uiSlice.milestone === "p0_ops_vault_blocked"
      ? `Channel orders blocked — configure ${nextPhase.label} before LIVE Woo/Shopify ingest`
      : channelLiveProofBlocked
        ? "Channel live smoke incomplete — do not treat Order hub channel rows as production LIVE"
        : `Commercial pilot blocked — ${uiSlice.topBlockerTitle}`;

  return {
    policyId: ORDER_HUB_COMMERCIAL_OPS_ERA28_POLICY_ID,
    visible: true,
    headline,
    detail: uiSlice.topBlockerDetail,
    p0ProofStatus: uiSlice.p0ProofStatus,
    vaultMissingCount: uiSlice.p0VaultMissingCount,
    topBlockerTitle: uiSlice.topBlockerTitle,
    vaultPhaseLabel: nextPhase?.label ?? null,
    missingKeys: nextPhase?.missingKeys ?? [],
    docPath: nextPhase?.docPath ?? null,
    platformOpsHref: uiSlice.platformOpsHref,
    integrationHealthHref: `/dashboard/integration-health${INTEGRATION_HEALTH_RECOVERY_ANCHOR}`,
    channelLiveProofBlocked,
  };
}
