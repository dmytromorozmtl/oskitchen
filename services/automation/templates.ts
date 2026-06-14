import type { AutomationActionType, AutomationTriggerType } from "@prisma/client";

export type AutomationTemplateDefinition = {
  key: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  triggers: AutomationTriggerType[];
  actions: AutomationActionType[];
};

/** Starter templates — persisted rows created via seed or future “Add from template” UI. */
export const AUTOMATION_TEMPLATES: AutomationTemplateDefinition[] = [
  {
    key: "preorder_deadline_reminder",
    label: "Preorder deadline reminder",
    description: "Ping ops before the weekly cutoff when orders are still light.",
    defaultEnabled: false,
    triggers: ["SCHEDULED_CRON"],
    actions: ["NOTIFY_IN_APP", "NOTIFY_EMAIL"],
  },
  {
    key: "production_prep_reminder",
    label: "Production prep reminder",
    description: "Surface when production tasks are behind before service window.",
    defaultEnabled: false,
    triggers: ["SCHEDULED_CRON", "PRODUCTION_COMPLETED"],
    actions: ["NOTIFY_IN_APP", "CREATE_TASK"],
  },
  {
    key: "low_inventory_warning",
    label: "Low inventory warning",
    description: "When modeled stock crosses thresholds for hero SKUs.",
    defaultEnabled: false,
    triggers: ["INVENTORY_LOW"],
    actions: ["NOTIFY_IN_APP", "LOG_ONLY"],
  },
  {
    key: "inactive_customer_followup",
    label: "Inactive customer follow-up",
    description: "Cadence when repeat guests go quiet for N weeks.",
    defaultEnabled: false,
    triggers: ["SCHEDULED_CRON"],
    actions: ["NOTIFY_EMAIL", "CREATE_TASK"],
  },
  {
    key: "trial_ending_reminder",
    label: "Trial ending reminder",
    description: "Internal nudge before subscription trial windows close.",
    defaultEnabled: false,
    triggers: ["SCHEDULED_CRON"],
    actions: ["NOTIFY_IN_APP", "NOTIFY_EMAIL"],
  },
  {
    key: "failed_sync_alert",
    label: "Failed sync alert",
    description: "When channel sync or webhooks fail repeatedly.",
    defaultEnabled: true,
    triggers: ["INTEGRATION_FAILED", "WEBHOOK_FAILED"],
    actions: ["NOTIFY_IN_APP", "WEBHOOK_OUTBOUND"],
  },
];
