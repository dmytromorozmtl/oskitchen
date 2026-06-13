/**
 * Blueprint P3-74 — Webhook replay/retry UI (integration health bridge + cert).
 *
 * @see docs/WEBHOOK_REPLAY_WITH_AUDIT.md
 * @see docs/webhook-replay-ui-p3-74.md
 */

import {
  WEBHOOK_REPLAY_UI_NPM_SCRIPT,
  WEBHOOK_REPLAY_UI_POLICY_ID,
  WEBHOOK_REPLAY_UI_ROUTE_FILES,
  WEBHOOK_REPLAY_UI_UNIT_TEST,
} from "@/lib/webhooks/webhook-replay-ui-policy";

export const WEBHOOK_REPLAY_UI_P3_74_POLICY_ID = "webhook-replay-ui-p3-74-v1" as const;

export const WEBHOOK_REPLAY_UI_P3_74_DOC = "docs/webhook-replay-ui-p3-74.md" as const;

export const WEBHOOK_REPLAY_UI_P3_74_ARTIFACT =
  "artifacts/webhook-replay-ui-p3-74-registry.json" as const;

export const WEBHOOK_REPLAY_UI_P3_74_AUDIT_SCRIPT =
  "scripts/audit-webhook-replay-ui-p3-74.ts" as const;

export const WEBHOOK_REPLAY_UI_P3_74_NPM_SCRIPT = "audit:webhook-replay-ui-p3-74" as const;

export const WEBHOOK_REPLAY_UI_P3_74_CHECK_NPM_SCRIPT =
  "check:webhook-replay-ui-p3-74" as const;

export const WEBHOOK_REPLAY_UI_P3_74_UNIT_TEST =
  "tests/unit/webhook-replay-ui-p3-74.test.ts" as const;

export const WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_POLICY_ID = WEBHOOK_REPLAY_UI_POLICY_ID;

export const WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_TEST = WEBHOOK_REPLAY_UI_UNIT_TEST;

export const WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_DOC = "docs/WEBHOOK_REPLAY_WITH_AUDIT.md" as const;

/** Wave 2 — integration health surfaces replay CTA when queue has failures. */
export const WEBHOOK_REPLAY_UI_P3_74_HEALTH_ROUTE =
  "/dashboard/integrations/health" as const;

export const WEBHOOK_REPLAY_UI_P3_74_HEALTH_PANEL =
  "components/integrations/webhook-replay-health-panel.tsx" as const;

export const WEBHOOK_REPLAY_UI_P3_74_HEALTH_PAGE =
  "app/dashboard/integrations/health/page.tsx" as const;

export const WEBHOOK_REPLAY_UI_P3_74_NPM_SCRIPTS = [
  "test:ci:webhook-replay-ui",
  "test:ci:webhook-replay-ui-p3-74:cert",
  WEBHOOK_REPLAY_UI_NPM_SCRIPT,
] as const;

export const WEBHOOK_REPLAY_UI_P3_74_WIRING_PATHS = [
  WEBHOOK_REPLAY_UI_P3_74_DOC,
  WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_DOC,
  WEBHOOK_REPLAY_UI_ROUTE_FILES.workspacePrimary,
  WEBHOOK_REPLAY_UI_ROUTE_FILES.platform,
  WEBHOOK_REPLAY_UI_P3_74_HEALTH_PANEL,
  WEBHOOK_REPLAY_UI_P3_74_HEALTH_PAGE,
  "lib/webhooks/webhook-replay-ui-p3-74-measurement.ts",
  "lib/webhooks/webhook-replay-ui-p3-74-audit.ts",
  WEBHOOK_REPLAY_UI_P3_74_UNIT_TEST,
  WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_TEST,
  WEBHOOK_REPLAY_UI_P3_74_ARTIFACT,
] as const;
