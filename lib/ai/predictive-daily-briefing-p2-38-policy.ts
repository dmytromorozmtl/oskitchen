/**
 * Blueprint P2-38 — Predictive daily briefing (Toast IQ parity).
 *
 * All-channel today forecasts on /dashboard/today.
 *
 * @see docs/predictive-daily-briefing-p2-38.md
 * @see lib/ai/predictive-daily-briefing-channel-forecast.ts
 */

export const PREDICTIVE_DAILY_BRIEFING_P2_38_POLICY_ID =
  "predictive-daily-briefing-p2-38-v1" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_DOC =
  "docs/predictive-daily-briefing-p2-38.md" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_FORECAST_MODULE =
  "lib/ai/predictive-daily-briefing-channel-forecast.ts" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_BRIEFING_SERVICE =
  "services/ai/ai-restaurant-brain.ts" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL =
  "components/dashboard/ai-briefing-panel.tsx" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_TODAY_PAGE =
  "app/dashboard/today/page.tsx" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_TODAY_ROUTE = "/dashboard/today" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_AUDIT_SCRIPT =
  "scripts/audit-predictive-daily-briefing-p2-38.ts" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_NPM_SCRIPT =
  "audit:predictive-daily-briefing-p2-38" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_CHECK_NPM_SCRIPT =
  "check:predictive-daily-briefing-p2-38" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_UNIT_TEST =
  "tests/unit/predictive-daily-briefing-p2-38.test.ts" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_COMPETITOR = "toast" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_COUNT = 10 as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL_TEST_ID =
  "predictive-daily-briefing-channels" as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_FLOW_STEPS = [
  "load_channel_order_history",
  "build_channel_today_forecasts",
  "render_today_briefing_panel",
  "verify_owner_visibility",
] as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_HONESTY_MARKERS = [
  "AI-assisted",
  "directional",
  "verify",
  "not certified",
  "Toast IQ parity",
] as const;

export const PREDICTIVE_DAILY_BRIEFING_P2_38_WIRING_PATHS = [
  PREDICTIVE_DAILY_BRIEFING_P2_38_DOC,
  PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_FORECAST_MODULE,
  "lib/ai/predictive-daily-briefing-p2-38-audit.ts",
  PREDICTIVE_DAILY_BRIEFING_P2_38_BRIEFING_SERVICE,
  PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL,
  PREDICTIVE_DAILY_BRIEFING_P2_38_TODAY_PAGE,
  "lib/ai/restaurant-brain-types.ts",
  PREDICTIVE_DAILY_BRIEFING_P2_38_UNIT_TEST,
] as const;
