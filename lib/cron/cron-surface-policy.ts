/**
 * Cron route surface policy — Evolution Era 4 Cycle 4.
 *
 * Production schedules and runtime gates use only ALLOWED_PRODUCTION_CRON_SLUGS (18).
 * Experimental handlers live under archive/cron-routes/ and are not App Router routes.
 */

export const CRON_SURFACE_POLICY_ID = "era4-active-production-only-v1" as const;

/** Expected production cron slugs on disk under app/api/cron (must match production-manifest). */
export const CRON_ACTIVE_PRODUCTION_ROUTE_COUNT = 18;

/** Minimum archived experimental routes after Era 4 bulk archive (121 moved 2026-05-27). */
export const CRON_ARCHIVED_EXPERIMENTAL_MIN_COUNT = 121;

export const CRON_SURFACE_POLICY_SUMMARY =
  "Only 18 production cron routes remain under app/api/cron; experimental crons are archived under archive/cron-routes and blocked in production unless ENABLE_EXPERIMENTAL_CRONS=true.";
