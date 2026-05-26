export const STOREFRONT_ANALYTICS_CONSENT_COOKIE = "kos_analytics_consent";
export const ANALYTICS_MODES = ["DISABLED", "ENABLED_WITH_CONSENT", "ENABLED_NO_BANNER"] as const;
export type StorefrontAnalyticsConsentMode = (typeof ANALYTICS_MODES)[number];

export function parseAnalyticsConsentMode(raw: string | null | undefined): StorefrontAnalyticsConsentMode {
  const v = (raw ?? "").trim().toUpperCase();
  if (v === "DISABLED") return "DISABLED";
  if (v === "ENABLED_WITH_CONSENT") return "ENABLED_WITH_CONSENT";
  return "ENABLED_NO_BANNER";
}

export const FIRST_PARTY_ANALYTICS_MODES = ["ALWAYS_ON", "CONSENT_REQUIRED", "DISABLED"] as const;
export type FirstPartyAnalyticsMode = (typeof FIRST_PARTY_ANALYTICS_MODES)[number];

export function parseFirstPartyAnalyticsMode(raw: string | null | undefined): FirstPartyAnalyticsMode {
  const v = (raw ?? "").trim().toUpperCase();
  if (v === "CONSENT_REQUIRED") return "CONSENT_REQUIRED";
  if (v === "DISABLED") return "DISABLED";
  return "ALWAYS_ON";
}
