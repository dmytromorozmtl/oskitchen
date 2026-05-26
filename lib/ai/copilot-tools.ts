import type { CopilotActionType } from "@/lib/ai/copilot-types";

/**
 * Catalogue of *draft* tools the copilot can suggest. The copilot
 * itself never executes any of these — drafts land in
 * `CopilotActionDraft` and require human approval.
 */
export type CopilotToolDefinition = {
  actionType: CopilotActionType;
  label: string;
  description: string;
  requiredCapability:
    | "copilot.actions.draft"
    | "copilot.actions.approve";
  payloadShape: string;
  example: Record<string, unknown>;
};

export const COPILOT_TOOLS: Record<CopilotActionType, CopilotToolDefinition> = {
  create_task: {
    actionType: "create_task",
    label: "Create kitchen / ops task",
    description: "Draft a new KitchenTask row with title, due date, and assignee suggestion.",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ title: string; description?: string; dueAt?: ISO; assigneeId?: string }',
    example: {
      title: "Re-check packing for batch B-22",
      description: "Pack-through rate dipped below 90% earlier this hour.",
      dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
  },
  create_follow_up: {
    actionType: "create_follow_up",
    label: "Create customer follow-up",
    description: "Draft a CRM follow-up reminder for a customer.",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ customerId: string; reason: string; dueAt: ISO }',
    example: {
      customerId: "<customer-id>",
      reason: "Check in after delivery exception.",
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  create_purchasing_reminder: {
    actionType: "create_purchasing_reminder",
    label: "Create purchasing reminder",
    description: "Draft a reminder to issue a purchase order for a shortage.",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ ingredientName: string; quantity?: string; note?: string }',
    example: {
      ingredientName: "Avocado",
      quantity: "12 cases",
      note: "Imminent shortage for Saturday meal-prep run.",
    },
  },
  draft_production_note: {
    actionType: "draft_production_note",
    label: "Draft production note",
    description: "Draft a note for the production board (no record is updated yet).",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ batchId?: string; note: string }',
    example: {
      note: "Add a second tray of brownies — preorders exceeded forecast.",
    },
  },
  draft_customer_follow_up_note: {
    actionType: "draft_customer_follow_up_note",
    label: "Draft customer follow-up note",
    description: "Draft polite outreach text for a CRM follow-up.",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ customerId: string; channel: "email" | "phone" | "in_person"; note: string }',
    example: {
      customerId: "<customer-id>",
      channel: "email",
      note: "Apologise for late delivery on Tuesday and offer a 10% credit.",
    },
  },
  draft_catering_quote_follow_up: {
    actionType: "draft_catering_quote_follow_up",
    label: "Draft catering quote follow-up",
    description: "Draft a follow-up task for an overdue catering quote.",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ quoteId: string; dueAt: ISO; note?: string }',
    example: {
      quoteId: "<quote-id>",
      dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      note: "Confirm headcount and dietary needs.",
    },
  },
  draft_route_issue_task: {
    actionType: "draft_route_issue_task",
    label: "Draft route-issue task",
    description: "Draft a task to investigate a failed delivery stop.",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ routeId?: string; stopId?: string; note: string }',
    example: {
      stopId: "<stop-id>",
      note: "Stop marked FAILED — confirm address with customer before re-attempt.",
    },
  },
  suggest_menu_adjustment: {
    actionType: "suggest_menu_adjustment",
    label: "Suggest menu adjustment",
    description: "Suggest a temporary menu tweak (e.g. 86 an item) for human review.",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ productId?: string; suggestion: string }',
    example: { suggestion: "Temporarily 86 avocado toast — shortage flagged." },
  },
  suggest_ingredient_demand_run: {
    actionType: "suggest_ingredient_demand_run",
    label: "Suggest ingredient demand run",
    description: "Suggest re-running the ingredient demand calculation.",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ reason: string }',
    example: { reason: "Production forecast for next week not yet calculated." },
  },
  suggest_report_export: {
    actionType: "suggest_report_export",
    label: "Suggest report export",
    description: "Suggest exporting a specific report from the Reports center.",
    requiredCapability: "copilot.actions.draft",
    payloadShape: '{ reportKey: string; reason: string }',
    example: {
      reportKey: "executive_weekly_summary",
      reason: "Owner is reviewing weekly health.",
    },
  },
};

export const COPILOT_TOOL_KEYS = Object.keys(COPILOT_TOOLS) as CopilotActionType[];
