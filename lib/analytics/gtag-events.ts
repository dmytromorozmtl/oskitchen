/** Client-side Google Analytics / Ads event helpers (no-op when gtag unavailable). */

type GtagFn = (...args: unknown[]) => void;

function gtag(): GtagFn | undefined {
  if (typeof window === "undefined") return undefined;
  const fn = (window as unknown as { gtag?: GtagFn }).gtag;
  return typeof fn === "function" ? fn : undefined;
}

export function trackGtagEvent(eventName: string, params?: Record<string, unknown>) {
  const send = gtag();
  if (!send) return;
  send("event", eventName, params ?? {});
}

export function trackGoogleAdsConversion(conversionLabel: string, value = 0) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();
  if (!adsId || typeof window === "undefined") return;

  const send = gtag();
  if (!send) return;

  send("event", "conversion", {
    send_to: `${adsId}/${conversionLabel}`,
    value,
    currency: "USD",
  });
}

export function trackSignupConversion() {
  trackGoogleAdsConversion("SIGNUP", 0);
  trackGtagEvent("sign_up", { method: "email" });
}

export function trackPricingView() {
  trackGtagEvent("view_pricing");
}
