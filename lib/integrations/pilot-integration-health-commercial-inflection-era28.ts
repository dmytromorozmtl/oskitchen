/**
 * Today pilot integration health strip — commercial inflection footnote (registry LIVE honesty).
 */

import type { CommercialInflectionMilestone } from "@/lib/commercial/commercial-inflection-readiness-era28";
import type { CommercialInflectionReadinessUiSlice } from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import { formatCommercialInflectionScorecardLabel } from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";

export const PILOT_INTEGRATION_HEALTH_COMMERCIAL_INFLECTION_ERA28_POLICY_ID =
  "era28-pilot-integration-health-commercial-inflection-v1" as const;

export type PilotIntegrationHealthCommercialInflectionFootnote = {
  policyId: typeof PILOT_INTEGRATION_HEALTH_COMMERCIAL_INFLECTION_ERA28_POLICY_ID;
  scorecardLabel: string;
  registryHonestyLine: string;
  topBlockerTitle: string;
  topBlockerDetail: string;
  milestone: CommercialInflectionMilestone;
  p0VaultMissingCount: number;
  platformOpsHref: string;
  integrationHealthHref: string;
};

export function buildPilotIntegrationHealthCommercialInflectionFootnote(
  slice: CommercialInflectionReadinessUiSlice | null,
): PilotIntegrationHealthCommercialInflectionFootnote | null {
  if (!slice) return null;

  return {
    policyId: PILOT_INTEGRATION_HEALTH_COMMERCIAL_INFLECTION_ERA28_POLICY_ID,
    scorecardLabel: formatCommercialInflectionScorecardLabel(slice),
    registryHonestyLine: `Registry LIVE: integrations ${slice.integrationRegistryLiveCount} · channels ${slice.channelRegistryLiveCount}`,
    topBlockerTitle: slice.topBlockerTitle,
    topBlockerDetail: slice.topBlockerDetail,
    milestone: slice.milestone,
    p0VaultMissingCount: slice.p0VaultMissingCount,
    platformOpsHref: slice.platformOpsHref,
    integrationHealthHref: slice.integrationHealthHref,
  };
}

export function augmentPilotIntegrationHealthStripWithCommercialInflection(
  model: PilotIntegrationHealthStripModel,
  slice: CommercialInflectionReadinessUiSlice | null,
): PilotIntegrationHealthStripModel & {
  commercialInflection: PilotIntegrationHealthCommercialInflectionFootnote | null;
} {
  const footnote = buildPilotIntegrationHealthCommercialInflectionFootnote(slice);
  if (!footnote) {
    return { ...model, commercialInflection: null };
  }

  const headline =
    footnote.milestone === "p0_ops_vault_blocked"
      ? `${model.headline} Market inflection blocked — ${footnote.topBlockerTitle} (${footnote.p0VaultMissingCount}/11 vault). ${footnote.registryHonestyLine}.`
      : `${model.headline} ${footnote.registryHonestyLine}.`;

  return {
    ...model,
    headline,
    commercialInflection: footnote,
  };
}
