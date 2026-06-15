/**
 * Integration Health support admin — vault phased commercial ops guidance for triage.
 */
import type { CommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { buildCommercialPilotOpsInflectionSlice } from "@/lib/commercial/commercial-pilot-ops-inflection-era28";
import {
  COMMERCIAL_PILOT_OPS_STATUS_PLATFORM_ROUTE,
  COMMERCIAL_PILOT_P0_STAGING_ANCHOR,
} from "@/lib/commercial/commercial-pilot-ops-status-era18-policy";

export const INTEGRATION_HEALTH_SUPPORT_ADMIN_COMMERCIAL_OPS_ERA28_POLICY_ID =
  "era28-integration-health-support-admin-commercial-ops-v1" as const;

export type IntegrationHealthSupportAdminVaultOpsSlice = {
  policyId: typeof INTEGRATION_HEALTH_SUPPORT_ADMIN_COMMERCIAL_OPS_ERA28_POLICY_ID;
  visible: boolean;
  headline: string;
  detail: string;
  p0ProofStatus: string;
  vaultMissingCount: number;
  vaultPhaseLabel: string | null;
  missingKeys: readonly string[];
  docPath: string | null;
  platformOpsHref: string;
  channelLiveProofBlocked: boolean;
  ssoProofBlocked: boolean;
};

export function buildIntegrationHealthSupportAdminVaultOpsSlice(
  commercialOps: CommercialPilotOpsStatusModel | null | undefined,
): IntegrationHealthSupportAdminVaultOpsSlice | null {
  if (!commercialOps) return null;

  const inflection = buildCommercialPilotOpsInflectionSlice(commercialOps);
  const uiSlice = inflection.uiSlice;
  if (!uiSlice) return null;

  const p0 = commercialOps.p0Staging.summary;
  const vaultHero = inflection.vaultHero;
  const nextPhase = vaultHero?.nextPhase ?? null;
  const channelProof = p0?.children?.channelLive?.proofStatus ?? null;
  const ssoProof = p0?.children?.ssoIdpStaging?.proofStatus ?? null;

  const channelLiveProofBlocked =
    p0?.p0ProofStatus !== "proof_passed" &&
    (!channelProof ||
      channelProof.includes("proof_failed") ||
      channelProof.includes("proof_skipped"));

  const ssoProofBlocked =
    p0?.p0ProofStatus !== "proof_passed" &&
    (!ssoProof ||
      ssoProof.includes("proof_failed") ||
      ssoProof.includes("proof_skipped"));

  const platformOpsHref =
    vaultHero?.platformOpsHref ??
    `${COMMERCIAL_PILOT_OPS_STATUS_PLATFORM_ROUTE}${COMMERCIAL_PILOT_P0_STAGING_ANCHOR}`;

  const headline =
    nextPhase && uiSlice.milestone === "p0_ops_vault_blocked"
      ? `Support triage — configure ${nextPhase.label} before engineering PASS or LIVE channel claims`
      : channelLiveProofBlocked && ssoProofBlocked
        ? "Support triage — channel live and SSO IdP proofs incomplete; do not treat integration cards as production LIVE"
        : channelLiveProofBlocked
          ? "Support triage — channel live smoke incomplete; Woo/Shopify ingest not production-certified"
          : ssoProofBlocked
            ? "Support triage — SSO IdP staging proof incomplete; enterprise login not pilot-certified"
            : `Commercial pilot blocked — ${uiSlice.topBlockerTitle}`;

  return {
    policyId: INTEGRATION_HEALTH_SUPPORT_ADMIN_COMMERCIAL_OPS_ERA28_POLICY_ID,
    visible: true,
    headline,
    detail: uiSlice.topBlockerDetail,
    p0ProofStatus: uiSlice.p0ProofStatus,
    vaultMissingCount: uiSlice.p0VaultMissingCount,
    vaultPhaseLabel: nextPhase?.label ?? null,
    missingKeys: nextPhase?.missingKeys ?? [],
    docPath: nextPhase?.docPath ?? null,
    platformOpsHref,
    channelLiveProofBlocked,
    ssoProofBlocked,
  };
}
