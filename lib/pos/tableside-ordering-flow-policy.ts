/**
 * Absolute Final Task 42 — tableside ordering flow (TouchBistro parity).
 */

export const TABLESIDE_ORDERING_FLOW_POLICY_ID =
  "tableside-ordering-flow-absolute-final-v1" as const;

export const TABLESIDE_ORDERING_ROUTE = "/dashboard/pos/handheld" as const;

export const TABLESIDE_ORDERING_CLIENT_PATH =
  "components/pos/handheld-ordering-client.tsx" as const;

export const TABLESIDE_ORDERING_FLOW_STRIP_PATH =
  "components/pos/tableside-ordering-flow-strip.tsx" as const;

export const TABLESIDE_ORDERING_SERVICE_PATH =
  "services/pos/tableside-ordering-flow-service.ts" as const;

export const TABLESIDE_ORDERING_KDS_FIRE_PATH =
  "services/pos/handheld-kds-fire-service.ts" as const;

export const TABLESIDE_ORDERING_FLOOR_PLAN_ROUTE = "/dashboard/tables" as const;

export const TABLESIDE_ORDERING_CI_SCRIPTS = ["test:ci:tableside-ordering-flow"] as const;

/** TouchBistro-parity waiter steps — select → tab → items → kitchen → pay. */
export const TABLESIDE_FLOW_STEPS = [
  {
    id: "select_table",
    label: "Select table",
    description: "Pick the guest's table from the floor plan or grid.",
  },
  {
    id: "open_tab",
    label: "Open tab",
    description: "Start or resume a running check for the table.",
  },
  {
    id: "add_items",
    label: "Add items",
    description: "Tap menu items — modifiers and courses follow POS catalog.",
  },
  {
    id: "fire_kds",
    label: "Fire KDS",
    description: "Send items to kitchen prep tickets with DINE_IN routing.",
  },
  {
    id: "pay_close",
    label: "Pay & close",
    description: "Cash checkout offline-safe, or settle tab at register.",
  },
] as const;

export type TablesideFlowStepId = (typeof TABLESIDE_FLOW_STEPS)[number]["id"];

export type TablesideFlowState = {
  selectedTableId: string | null;
  hasOpenTab: boolean;
  tabItemCount: number;
  cartLineCount: number;
  lastKdsOrderId: string | null;
};

export function tablesideOrderHref(tableId?: string | null): string {
  if (!tableId) return TABLESIDE_ORDERING_ROUTE;
  return `${TABLESIDE_ORDERING_ROUTE}?tableId=${encodeURIComponent(tableId)}`;
}

export function inferTablesideFlowStep(state: TablesideFlowState): TablesideFlowStepId {
  if (!state.selectedTableId) return "select_table";
  if (state.cartLineCount > 0) return "fire_kds";
  if (state.tabItemCount > 0 || state.lastKdsOrderId) return "pay_close";
  if (!state.hasOpenTab) return "open_tab";
  return "add_items";
}

export function tablesideFlowStepIndex(stepId: TablesideFlowStepId): number {
  return TABLESIDE_FLOW_STEPS.findIndex((step) => step.id === stepId);
}

export function isTablesideFlowStepComplete(
  stepId: TablesideFlowStepId,
  currentStepId: TablesideFlowStepId,
): boolean {
  return tablesideFlowStepIndex(stepId) < tablesideFlowStepIndex(currentStepId);
}

export type TablesideOrderingReadiness = {
  tableCount: number;
  registerCount: number;
  staffCount: number;
  productCount: number;
  ready: boolean;
  blockers: string[];
};

export function assessTablesideOrderingReadiness(input: {
  tableCount: number;
  registerCount: number;
  staffCount: number;
  productCount: number;
}): TablesideOrderingReadiness {
  const blockers: string[] = [];
  if (input.tableCount === 0) blockers.push("Add tables under Floor plan");
  if (input.registerCount === 0) blockers.push("Create a POS register");
  if (input.staffCount === 0) blockers.push("Add staff for attribution");
  if (input.productCount === 0) blockers.push("Add POS-visible products");

  return {
    tableCount: input.tableCount,
    registerCount: input.registerCount,
    staffCount: input.staffCount,
    productCount: input.productCount,
    ready: blockers.length === 0,
    blockers,
  };
}
