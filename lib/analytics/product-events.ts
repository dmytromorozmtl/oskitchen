"use client";

/** Typed product funnel events for PostHog (when NEXT_PUBLIC_POSTHOG_KEY is set). */
export type ProductEventName =
  | "signup_completed"
  | "onboarding_step_completed"
  | "first_order_created"
  | "storefront_published"
  | "pos_first_use"
  | "pilot_day_30"
  | "web_vitals"
  | "roi_lead_submitted"
  | "nps_submitted"
  | "briefing_click"
  | "briefing_view";

export function captureProductEvent(
  name: ProductEventName,
  properties?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === "undefined" || !window.posthog?.capture) return;
  const clean: Record<string, string | number | boolean> = {};
  if (properties) {
    for (const [k, v] of Object.entries(properties)) {
      if (v !== null && v !== undefined) clean[k] = v;
    }
  }
  window.posthog.capture(name, clean);
}
