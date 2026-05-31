/** GA4 helpers for comparing first-party experiment CSV with Google Analytics. */

export function normalizeGa4MeasurementId(raw: string | null | undefined): string | null {
  const id = raw?.trim();
  if (!id) return null;
  if (/^G-[A-Z0-9]+$/i.test(id)) return id.toUpperCase();
  if (/^UA-\d+-\d+$/i.test(id)) return id;
  return id;
}

/** Opens GA4 web — property selection is account-specific (no universal deep link by G- ID). */
export function ga4WebHomeUrl(): string {
  return "https://analytics.google.com/analytics/web/";
}

/**
 * GA4 Explore deep link (property must be selected in browser session).
 * Custom dimension: register `experimentArm` (event scope) in Admin → Custom definitions.
 */
export function ga4ExploreExperimentArmUrl(measurementId: string | null): string {
  if (!measurementId) return ga4WebHomeUrl();
  const q = encodeURIComponent("experimentArm");
  return `https://analytics.google.com/analytics/web/#/analysis/explorer?params=_u..nav%3Dmaui&r=experiment-arm-${q}`;
}

/** Step-by-step CD registration (shown in dashboard; no separate doc file). */
export function ga4ExperimentArmDimensionSteps(measurementId: string | null): string[] {
  const id = measurementId ?? "G-XXXXXXXX";
  return [
    `GA4 Admin → Data display → Custom definitions → Create custom dimension.`,
    `Dimension name: experimentArm · Scope: Event · Event parameter: experimentArm (matches OS Kitchen beacon).`,
    `Measurement ID on this storefront: ${id}. Allow 24–48h for reporting after publish.`,
    `In Explore, add experimentArm as a breakdown and filter the same date range as your CSV export.`,
  ];
}

/** Suggested Explore report name / hint for ops comparing experiment arms. */
export function ga4ExperimentCompareHint(measurementId: string | null): string {
  if (!measurementId) {
    return "Add a Google Analytics measurement ID under Storefront → SEO to track parity checks.";
  }
  return `In GA4 (${measurementId}), compare checkout or purchase events for the same date range as your CSV export. Register event-scoped custom dimension experimentArm (see steps below) to segment draft vs published.`;
}
