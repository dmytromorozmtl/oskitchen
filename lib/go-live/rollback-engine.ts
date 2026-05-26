import type { GoLiveLaunchMode } from "@prisma/client";

export type RollbackStep = {
  order: number;
  title: string;
  description: string;
  module: string;
  actionRoute?: string;
};

export type RollbackPlanDraft = {
  title: string;
  triggerCondition: string;
  steps: RollbackStep[];
};

/** Common defaults the system seeds for a fresh GoLiveProject. */
export const DEFAULT_ROLLBACK_PLANS: RollbackPlanDraft[] = [
  {
    title: "Disable storefront orders",
    triggerCondition: "Critical storefront error within first 24h of launch.",
    steps: [
      { order: 1, title: "Pause checkout", description: "Disable checkout in Storefront settings.", module: "storefront", actionRoute: "/dashboard/storefront" },
      { order: 2, title: "Communicate", description: "Send customer notice with estimated resolution time.", module: "communications" },
      { order: 3, title: "Capture impact", description: "Log incident in Go-live incidents.", module: "go-live", actionRoute: "/dashboard/go-live/incidents" },
    ],
  },
  {
    title: "Disable channel intake",
    triggerCondition: "External channel produces invalid or duplicate orders.",
    steps: [
      { order: 1, title: "Disable channel", description: "Set the connection status to DISABLED in Sales Channels.", module: "sales-channels", actionRoute: "/dashboard/sales-channels" },
      { order: 2, title: "Revoke webhook", description: "Rotate webhook secret to stop inbound events.", module: "sales-channels", actionRoute: "/dashboard/sales-channels" },
      { order: 3, title: "Drain queue", description: "Cancel pending channel imports in the Order Hub.", module: "order-hub", actionRoute: "/dashboard/order-hub" },
    ],
  },
  {
    title: "Revert menu changes",
    triggerCondition: "Wrong menu published or prices incorrect.",
    steps: [
      { order: 1, title: "Restore from backup", description: "Use the most recent workspace export to restore menu state.", module: "import-export", actionRoute: "/dashboard/import-export" },
      { order: 2, title: "Republish", description: "Republish the corrected menu in Menus.", module: "menus", actionRoute: "/dashboard/menus" },
      { order: 3, title: "Document", description: "Record the rollback rehearsal in the activity log.", module: "go-live" },
    ],
  },
  {
    title: "Pause production",
    triggerCondition: "Kitchen flow blocked by missing ingredient or equipment.",
    steps: [
      { order: 1, title: "Halt new orders", description: "Set Storefront to paused.", module: "storefront", actionRoute: "/dashboard/storefront" },
      { order: 2, title: "Notify staff", description: "Page kitchen lead and dispatchers via in-app notifications.", module: "staff" },
      { order: 3, title: "Reassign queue", description: "Re-batch existing orders in the Production tab.", module: "production", actionRoute: "/dashboard/production" },
    ],
  },
];

export function rollbackPlansForLaunchMode(mode: GoLiveLaunchMode): RollbackPlanDraft[] {
  // Currently all modes seed the same set, but the function is here so
  // we can specialise later (e.g. pilot vs phased rollouts).
  if (mode === "PILOT") {
    return DEFAULT_ROLLBACK_PLANS.slice(0, 3);
  }
  return DEFAULT_ROLLBACK_PLANS;
}
