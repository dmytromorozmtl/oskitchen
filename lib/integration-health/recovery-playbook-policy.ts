import type { IntegrationHealthPredictiveAlert } from "@/services/integration-health/health-scoring-engine";

export const INTEGRATION_RECOVERY_PLAYBOOK_POLICY_ID =
  "critical-integration-recovery-playbook-v1" as const;

export type RecoveryPlaybookStepKind = "auto" | "manual";

export type RecoveryAutoAction =
  | "run_health_check"
  | "pull_inventory_sync"
  | "pull_cross_channel_sync";

export type RecoveryPlaybookStep = {
  id: string;
  kind: RecoveryPlaybookStepKind;
  title: string;
  detail: string;
  autoAction?: RecoveryAutoAction;
  href?: string;
};

export type RecoveryPlaybook = {
  alertCode: IntegrationHealthPredictiveAlert["code"];
  title: string;
  steps: RecoveryPlaybookStep[];
};

export const INTEGRATION_RECOVERY_PLAYBOOKS: RecoveryPlaybook[] = [
  {
    alertCode: "score_critical",
    title: "Critical integration health",
    steps: [
      {
        id: "auto-health-check",
        kind: "auto",
        title: "Re-run connection health check",
        detail: "Verifies live API reachability and records a fresh health-check row.",
        autoAction: "run_health_check",
      },
      {
        id: "manual-sales-channels",
        kind: "manual",
        title: "Review channel credentials",
        detail: "Rotate tokens or re-save Woo/Shopify credentials.",
        href: "/dashboard/sales-channels",
      },
      {
        id: "manual-webhooks",
        kind: "manual",
        title: "Inspect webhook queue",
        detail: "Clear signature failures and replay safe events.",
        href: "/dashboard/sales-channels/webhooks",
      },
    ],
  },
  {
    alertCode: "score_declining",
    title: "Declining health trend",
    steps: [
      {
        id: "auto-health-check",
        kind: "auto",
        title: "Baseline health check",
        detail: "Capture current latency and status before deeper triage.",
        autoAction: "run_health_check",
      },
      {
        id: "manual-error-recovery",
        kind: "manual",
        title: "Review error recovery queue",
        detail: "Resolve open webhook job failures tied to this channel.",
        href: "/dashboard/error-recovery",
      },
    ],
  },
  {
    alertCode: "sync_stale",
    title: "Stale catalog sync",
    steps: [
      {
        id: "auto-pull-inventory",
        kind: "auto",
        title: "Pull inventory sync snapshot",
        detail: "Refreshes Shopify/Woo stock levels and conflict queue.",
        autoAction: "pull_inventory_sync",
      },
      {
        id: "auto-pull-cross-channel",
        kind: "auto",
        title: "Pull cross-channel inventory",
        detail: "Reconciles POS spine vs marketplace channels.",
        autoAction: "pull_cross_channel_sync",
      },
      {
        id: "manual-product-mapping",
        kind: "manual",
        title: "Verify product mapping",
        detail: "Unmapped SKUs block sync from updating Kitchen quantities.",
        href: "/dashboard/product-mapping",
      },
    ],
  },
  {
    alertCode: "webhook_failures",
    title: "Webhook delivery failures",
    steps: [
      {
        id: "manual-webhook-queue",
        kind: "manual",
        title: "Triage webhook queue",
        detail: "Fix HMAC secrets and replay failed deliveries.",
        href: "/dashboard/sales-channels/webhooks",
      },
      {
        id: "manual-error-recovery",
        kind: "manual",
        title: "Error recovery replay",
        detail: "Use safe replay actions when available.",
        href: "/dashboard/error-recovery",
      },
    ],
  },
  {
    alertCode: "latency_spike",
    title: "Health-check latency spike",
    steps: [
      {
        id: "auto-health-check",
        kind: "auto",
        title: "Re-test connection latency",
        detail: "Confirms whether spike is transient or sustained.",
        autoAction: "run_health_check",
      },
      {
        id: "manual-health-dashboard",
        kind: "manual",
        title: "Review integration health history",
        detail: "Compare latency trend across recent checks.",
        href: "/dashboard/integrations/health",
      },
    ],
  },
  {
    alertCode: "auth_degraded",
    title: "Credentials need attention",
    steps: [
      {
        id: "manual-sales-channels",
        kind: "manual",
        title: "Re-authenticate channel",
        detail: "Update OAuth tokens or Woo consumer keys.",
        href: "/dashboard/sales-channels",
      },
      {
        id: "auto-health-check",
        kind: "auto",
        title: "Verify after credential update",
        detail: "Run after saving new credentials.",
        autoAction: "run_health_check",
      },
    ],
  },
];

export function getRecoveryPlaybookForAlert(
  code: IntegrationHealthPredictiveAlert["code"],
): RecoveryPlaybook | null {
  return INTEGRATION_RECOVERY_PLAYBOOKS.find((p) => p.alertCode === code) ?? null;
}

export type StoredRecoveryExecution = {
  id: string;
  connectionId: string;
  alertCode: string;
  stepId: string;
  autoAction?: RecoveryAutoAction;
  status: "success" | "failed" | "skipped";
  message?: string;
  executedAt: string;
};

export const RECOVERY_EXECUTION_HISTORY_LIMIT = 100 as const;

export function computeRecoverySuccessRate(
  executions: StoredRecoveryExecution[],
  filter?: { connectionId?: string; alertCode?: string; autoAction?: RecoveryAutoAction },
): { attempts: number; successes: number; successRate: number } {
  let rows = executions;
  if (filter?.connectionId) rows = rows.filter((r) => r.connectionId === filter.connectionId);
  if (filter?.alertCode) rows = rows.filter((r) => r.alertCode === filter.alertCode);
  if (filter?.autoAction) rows = rows.filter((r) => r.autoAction === filter.autoAction);

  const autoRows = rows.filter((r) => r.status !== "skipped");
  const attempts = autoRows.length;
  const successes = autoRows.filter((r) => r.status === "success").length;
  const successRate = attempts > 0 ? successes / attempts : 0;
  return { attempts, successes, successRate };
}
