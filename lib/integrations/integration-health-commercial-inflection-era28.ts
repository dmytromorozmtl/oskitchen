/**
 * Integration Health — commercial inflection market-readiness banner (honest registry LIVE counts).
 */

import {
  buildCommercialInflectionReadinessUiSlice,
  formatCommercialInflectionScorecardLabel,
  type CommercialInflectionReadinessUiSlice,
} from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { VaultReadinessReport } from "@/lib/ops/vault-readiness-report";
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";

export const INTEGRATION_HEALTH_COMMERCIAL_INFLECTION_ERA28_POLICY_ID =
  "era28-integration-health-commercial-inflection-v1" as const;

export type IntegrationHealthCommercialInflectionBanner = {
  policyId: typeof INTEGRATION_HEALTH_COMMERCIAL_INFLECTION_ERA28_POLICY_ID;
  visible: boolean;
  milestone: CommercialInflectionReadinessUiSlice["milestone"];
  headline: string;
  honestyNote: string;
  registryHonestyLine: string;
  inflection: CommercialInflectionReadinessUiSlice;
  nextActions: readonly { label: string; href: string }[];
};

export function buildIntegrationHealthCommercialInflectionBanner(input?: {
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  goNoGoSummary?: PilotGoNoGoSummary | null;
  vaultReport?: VaultReadinessReport | null;
}): IntegrationHealthCommercialInflectionBanner | null {
  const summary = evaluateCommercialInflectionReadiness(process.env, process.cwd(), {
    p0Staging: input?.p0Staging,
    tier2Staging: input?.tier2Summary,
    goNoGo: input?.goNoGoSummary,
    vaultReport: input?.vaultReport ?? null,
  });
  const inflection = buildCommercialInflectionReadinessUiSlice(summary, {
    vaultReport: input?.vaultReport ?? null,
    p0Staging: input?.p0Staging ?? null,
  });
  if (!inflection) return null;

  const registryHonestyLine =
    `Integration registry LIVE=${inflection.integrationRegistryLiveCount} · Channel registry LIVE=${inflection.channelRegistryLiveCount} — catalog honesty until engineering smokes PASS.`;

  const headline =
    inflection.milestone === "p0_ops_vault_blocked"
      ? input?.vaultReport?.nextPhase
        ? `Market inflection blocked — ${inflection.topBlockerTitle}: ${inflection.p0VaultMissingCount}/11 P0 ops vault vars missing.`
        : `Market inflection blocked — configure ${inflection.p0VaultMissingCount}/11 P0 ops vault vars before LIVE claims.`
      : inflection.milestone === "p0_staging_proof_blocked"
        ? "P0 vault vars may be present — run smoke:p0-staging-proof-unblock for proof_passed artifact."
        : `${formatCommercialInflectionScorecardLabel(inflection)} — ${inflection.topBlockerTitle}.`;

  return {
    policyId: INTEGRATION_HEALTH_COMMERCIAL_INFLECTION_ERA28_POLICY_ID,
    visible: true,
    milestone: inflection.milestone,
    headline,
    honestyNote:
      "Governance 100/100 means era policies + CI are wired — pilot executable score is market readiness. SKIPPED ≠ PASS.",
    registryHonestyLine,
    inflection,
    nextActions: [
      { label: "Commercial inflection ops", href: inflection.platformOpsHref },
      { label: "P0 ops playbook", href: `/dashboard/integration-health#integration-health-p0-trust` },
      { label: "Launch Wizard", href: "/dashboard/launch-wizard" },
    ],
  };
}
