/**
 * Single source of truth for which `/api/cron/*` slugs may run in production
 * without `ENABLE_EXPERIMENTAL_CRONS=true`.
 *
 * Align Vercel Cron schedules (`vercel.json`) with `ALLOWED_PRODUCTION_CRON_SLUGS` only.
 */

/** Product-critical crons — safe to schedule in production. */
export const ALLOWED_PRODUCTION_CRON_SLUGS = [
  "webhook-jobs",
  "reminders",
  "storefront-domain-recheck",
  "storefront-cart-recovery",
  "storefront-theme-publish",
  "storefront-team-invite-reminders",
  "storefront-webhook-retention",
  "storefront-invite-audit-retention",
  "storefront-ga4-parity",
  "storefront-edge-sync",
  "pilot-daily-health",
  "meal-plan-auto-renew",
  "menu-rotation",
  "doordash-sync",
  "kds-overdue-alerts",
  "incident-remediation-reminders",
  "shopify-b2b-dunning",
  "shopify-b2b-collector-digest",
  "outbound-webhook-deliveries",
] as const;

export type ProductionCronSlug = (typeof ALLOWED_PRODUCTION_CRON_SLUGS)[number];

/**
 * Fast-running production crons whose execution evidence should gate readiness.
 * Daily/weekly jobs are still recorded, but they are advisory rather than
 * immediate scheduler-health blockers.
 */
export const CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS = [
  "webhook-jobs",
  "storefront-edge-sync",
  "storefront-cart-recovery",
  "doordash-sync",
  "kds-overdue-alerts",
] as const satisfies readonly ProductionCronSlug[];

/**
 * Vercel cron schedules for production allowlist slugs.
 * Single source — consumed by `scripts/sync-vercel-crons.ts` (production profile).
 */
export const PRODUCTION_CRON_SCHEDULES: Record<ProductionCronSlug, string> = {
  "webhook-jobs": "*/5 * * * *",
  reminders: "0 14 * * *",
  "storefront-webhook-retention": "15 4 * * *",
  "storefront-edge-sync": "*/2 * * * *",
  "storefront-ga4-parity": "30 */6 * * *",
  "storefront-domain-recheck": "0 */6 * * *",
  "storefront-team-invite-reminders": "0 10 * * *",
  "storefront-invite-audit-retention": "0 3 * * 0",
  "storefront-cart-recovery": "*/30 * * * *",
  "storefront-theme-publish": "*/15 * * * *",
  "pilot-daily-health": "0 8 * * *",
  "meal-plan-auto-renew": "0 6 * * *",
  "menu-rotation": "0 7 * * *",
  "doordash-sync": "*/5 * * * *",
  "kds-overdue-alerts": "*/10 * * * *",
  "incident-remediation-reminders": "17 * * * *",
  "shopify-b2b-dunning": "0 9 * * *",
  "shopify-b2b-collector-digest": "0 10 * * *",
  "outbound-webhook-deliveries": "*/5 * * * *",
};

export type ProductionCronEntry = { path: string; schedule: string };

/** Build Vercel cron entries from the production manifest (deterministic order). */
export function buildProductionCronEntries(): ProductionCronEntry[] {
  return ALLOWED_PRODUCTION_CRON_SLUGS.map((slug) => ({
    path: `/api/cron/${slug}`,
    schedule: PRODUCTION_CRON_SCHEDULES[slug],
  }));
}

const PRODUCTION_SLUG_SET = new Set<string>(ALLOWED_PRODUCTION_CRON_SLUGS);

/** Full paths for ops / Vercel wiring. */
export const ALLOWED_PRODUCTION_CRON_PATHS: readonly string[] = ALLOWED_PRODUCTION_CRON_SLUGS.map(
  (slug) => `/api/cron/${slug}`,
);

/** Extract slug from `/api/cron/{slug}` or return null. */
export function cronSlugFromPathname(pathname: string): string | null {
  const prefix = "/api/cron/";
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length).replace(/\/+$/, "");
  if (!rest || rest.includes("/")) return null;
  return rest;
}

export function isAllowedProductionCronSlug(slug: string): slug is ProductionCronSlug {
  return PRODUCTION_SLUG_SET.has(slug);
}

export function isAllowedProductionCronPath(pathname: string): boolean {
  const slug = cronSlugFromPathname(pathname);
  return slug != null && isAllowedProductionCronSlug(slug);
}

/** Everything that is not on the production allowlist is treated as experimental. */
export function isExperimentalCronSlug(slug: string): boolean {
  return !PRODUCTION_SLUG_SET.has(slug);
}

export function isExperimentalCronPath(pathname: string): boolean {
  const slug = cronSlugFromPathname(pathname);
  if (!slug) return false;
  return isExperimentalCronSlug(slug);
}

export {
  EXPERIMENTAL_CRON_PATHS,
  listExperimentalCronPathsOnDisk,
  listExperimentalCronSlugsOnDisk,
} from "@/services/cron/cron-route-inventory";
