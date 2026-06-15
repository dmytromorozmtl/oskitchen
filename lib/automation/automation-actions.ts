/** Mirrors `AutomationActionType` — used by builders without importing Prisma on the client edge. */
export const AUTOMATION_ACTION_LABELS: Record<string, string> = {
  SEND_NOTIFICATION: "Send notification",
  CREATE_TASK: "Create task",
  WEBHOOK_OUTBOUND: "Outbound webhook (if configured)",
};
