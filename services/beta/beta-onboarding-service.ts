import type { BetaLead } from "@prisma/client";

export type OnboardingReadinessDimensions = {
  dataImportReadiness: number;
  integrationsReadiness: number;
  staffReadiness: number;
  operationalMaturity: number;
  productionReadiness: number;
  crmReadiness: number;
};

/** Heuristic 0–100 dimensions from stored application fields (no external telemetry yet). */
export function computeOnboardingReadinessDimensions(lead: Pick<
  BetaLead,
  | "weeklyOrderVolume"
  | "biggestPain"
  | "interestedFeatures"
  | "currentChannels"
  | "teamSize"
  | "locationsCount"
  | "integrationsNeeded"
  | "businessWebsite"
>): OnboardingReadinessDimensions {
  const channels = Array.isArray(lead.currentChannels)
    ? (lead.currentChannels as string[]).map((c) => String(c).toLowerCase())
    : [];
  const pain = (lead.biggestPain ?? "").length;
  const feats = JSON.stringify(lead.interestedFeatures ?? "").toLowerCase();
  const team = lead.teamSize ?? 0;
  const loc = lead.locationsCount ?? 0;
  const hasSite = Boolean(lead.businessWebsite?.trim());
  const integrationsText = (lead.integrationsNeeded ?? "").trim();

  const dataImportReadiness = clamp(38 + (channels.length > 1 ? 22 : 8) + (pain > 40 ? 12 : 0));
  const integrationsReadiness = clamp(
    30 + (integrationsText ? 24 : 0) + (feats.includes("integration") ? 18 : 0) + (channels.length > 2 ? 14 : 0),
  );
  const staffReadiness = clamp(40 + Math.min(40, team * 3));
  const operationalMaturity = clamp(35 + (pain > 30 ? 20 : 0) + (loc > 0 ? 12 : 0));
  const productionReadiness = clamp(
    36 + (feats.includes("production") || feats.includes("pack") ? 24 : 0) + (pain > 20 ? 12 : 0),
  );
  const crmReadiness = clamp(32 + (hasSite ? 18 : 0) + (feats.includes("crm") || feats.includes("customer") ? 20 : 0));

  return {
    dataImportReadiness,
    integrationsReadiness,
    staffReadiness,
    operationalMaturity,
    productionReadiness,
    crmReadiness,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
