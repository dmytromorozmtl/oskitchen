/**
 * Platform commercial-pilot-ops — inflection slice wired to vault readiness report.
 */
import type { CommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import {
  evaluateCommercialInflectionReadiness,
  type CommercialInflectionReadinessSummary,
} from "@/lib/commercial/commercial-inflection-readiness-era28";
import { buildP0OpsVaultUiSlice, type P0OpsVaultUiSlice } from "@/lib/commercial/p0-ops-vault-ui-era21";
import {
  buildCommercialInflectionReadinessUiSlice,
  type CommercialInflectionReadinessUiSlice,
} from "@/lib/commercial/commercial-inflection-readiness-ui-era28";

export const COMMERCIAL_PILOT_OPS_INFLECTION_ERA28_POLICY_ID =
  "era28-commercial-pilot-ops-inflection-v1" as const;

export type CommercialPilotOpsInflectionSlice = {
  policyId: typeof COMMERCIAL_PILOT_OPS_INFLECTION_ERA28_POLICY_ID;
  summary: CommercialInflectionReadinessSummary;
  uiSlice: CommercialInflectionReadinessUiSlice | null;
  vaultHero: P0OpsVaultUiSlice | null;
};

export function buildCommercialPilotOpsInflectionSlice(
  model: CommercialPilotOpsStatusModel,
): CommercialPilotOpsInflectionSlice {
  const p0 = model.p0Staging.summary;
  const vaultReport = model.vaultReadiness?.report ?? null;
  const summary = evaluateCommercialInflectionReadiness(process.env, process.cwd(), {
    p0Staging: p0,
    tier2Staging: model.tier2Staging?.summary ?? null,
    goNoGo: model.goNoGo.summary,
    vaultReport,
  });
  const vaultHero = buildP0OpsVaultUiSlice(p0, vaultReport);
  const uiSlice = buildCommercialInflectionReadinessUiSlice(summary, {
    vaultReport,
    p0Staging: p0,
  });

  return {
    policyId: COMMERCIAL_PILOT_OPS_INFLECTION_ERA28_POLICY_ID,
    summary,
    uiSlice,
    vaultHero,
  };
}

export function resolveTodayCommercialInflectionUiSlice(
  model: CommercialPilotOpsStatusModel,
): CommercialInflectionReadinessUiSlice | null {
  return buildCommercialPilotOpsInflectionSlice(model).uiSlice;
}
