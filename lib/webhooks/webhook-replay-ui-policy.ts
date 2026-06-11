/**
 * P1-37 — webhook replay UI: operators can retry failed inbound webhooks.
 */

export const WEBHOOK_REPLAY_UI_POLICY_ID = "webhook-replay-ui-p1-37-v1" as const;

export const WEBHOOK_REPLAY_UI_ACTION = "actions/webhook-replay.ts" as const;

export const WEBHOOK_REPLAY_UI_SERVICE = "services/webhooks/webhook-replay-service.ts" as const;

export const WEBHOOK_REPLAY_UI_ROW_COMPONENT =
  "components/integrations/webhook-replay-row.tsx" as const;

export const WEBHOOK_REPLAY_UI_CHECK_SCRIPT = "scripts/check-webhook-replay-ui.ts" as const;

export const WEBHOOK_REPLAY_UI_UNIT_TEST = "tests/unit/webhook-replay-ui.test.ts" as const;

export const WEBHOOK_REPLAY_UI_NPM_SCRIPT = "check:webhook-replay-ui" as const;

/** Surfaces where operators request audited replay. */
export const WEBHOOK_REPLAY_UI_SURFACES = ["workspace", "platform"] as const;

export type WebhookReplayUiSurface = (typeof WEBHOOK_REPLAY_UI_SURFACES)[number];

/** Dashboard routes that expose per-event replay forms. */
export const WEBHOOK_REPLAY_UI_WORKSPACE_ROUTES = [
  "/dashboard/sales-channels/webhooks",
  "/dashboard/integrations/webhooks",
] as const;

/** Platform operator DLQ + recent-events replay. */
export const WEBHOOK_REPLAY_UI_PLATFORM_ROUTE = "/platform/webhooks" as const;

export const WEBHOOK_REPLAY_UI_ROUTE_FILES = {
  workspacePrimary: "app/dashboard/sales-channels/webhooks/page.tsx",
  workspaceLegacy: "app/dashboard/integrations/webhooks/page.tsx",
  platform: "app/platform/webhooks/page.tsx",
} as const;

export const WEBHOOK_REPLAY_UI_PERMISSIONS = {
  workspace: "integrations.manage (via requireIntegrationsActor)",
  platform: "platform:integrations:repair",
} as const;

export const WEBHOOK_REPLAY_UI_CI_SCRIPTS = [
  "test:ci:webhook-replay-ui",
  WEBHOOK_REPLAY_UI_NPM_SCRIPT,
] as const;

export const WEBHOOK_REPLAY_UI_RUNBOOK_STEPS = [
  "Open /dashboard/sales-channels/webhooks (workspace) or /platform/webhooks (platform operator).",
  "Triage failed events — fix connector credentials or handler root cause first.",
  "Enter an audited replay reason (8–2000 chars, no customer PII).",
  "Submit Request replay — async queue re-enqueues when WEBHOOK_ASYNC_QUEUE=true, else inline handler runs.",
] as const;
