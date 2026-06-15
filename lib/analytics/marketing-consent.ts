/** Shared consent grants for GA4, Google Ads, Meta, and LinkedIn tags. */

export const MARKETING_CONSENT_COOKIE = "kitchenos-cookie-consent=true";
export const MARKETING_CONSENT_EVENT = "kitchenos:marketing-consent-changed";

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  _linkedin_partner_id?: string;
  lintrk?: (action: string, data?: Record<string, unknown>) => void;
};

function emitConsentChange(granted: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(MARKETING_CONSENT_EVENT, {
      detail: { granted },
    }),
  );
}

export function hasMarketingConsentCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(MARKETING_CONSENT_COOKIE);
}

function getGaMeasurementId(): string | null {
  const value = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return value ? value : null;
}

export function grantMarketingConsent() {
  if (typeof window === "undefined") return;
  const w = window as unknown as AnalyticsWindow & Record<string, unknown>;
  const gaId = getGaMeasurementId();

  if (gaId) {
    w[`ga-disable-${gaId}`] = false;
    w.gtag?.("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  }

  w.fbq?.("consent", "grant");
  emitConsentChange(true);
}

export function denyMarketingConsent() {
  if (typeof window === "undefined") return;
  const w = window as unknown as AnalyticsWindow & Record<string, unknown>;
  const gaId = getGaMeasurementId();
  if (gaId) {
    w[`ga-disable-${gaId}`] = true;
    w.gtag?.("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
  w.fbq?.("consent", "revoke");
  emitConsentChange(false);
}
