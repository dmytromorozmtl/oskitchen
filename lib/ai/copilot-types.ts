import type { CopilotInsightSeverity } from "@prisma/client";

export type CopilotCapability =
  | "copilot.view"
  | "copilot.chat"
  | "copilot.read.operations"
  | "copilot.read.financial"
  | "copilot.read.customer_pii"
  | "copilot.read.audit"
  | "copilot.actions.draft"
  | "copilot.actions.approve"
  | "copilot.settings.manage"
  | "copilot.narrative.toggle";

export type CopilotActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
};

export type CopilotSourceKey =
  | "orders"
  | "channels"
  | "webhooks"
  | "production"
  | "kitchen"
  | "packing"
  | "packing_verification"
  | "routes"
  | "tasks"
  | "customers"
  | "meal_plans"
  | "catering"
  | "inventory_demand"
  | "purchasing"
  | "costing"
  | "analytics"
  | "forecast"
  | "audit";

export type CopilotPiiLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export type CopilotSourceDefinition = {
  key: CopilotSourceKey;
  label: string;
  description: string;
  allowedRoles: string[];
  piiLevel: CopilotPiiLevel;
  maxRows: number;
  staleDataWarning?: string;
  recommendedRedaction: "OPERATIONAL_SUMMARY" | "PII_REDACTED" | "FULL_INTERNAL_ALLOWED";
};

export type CopilotInsightSeed = {
  type: string;
  severity: CopilotInsightSeverity;
  title: string;
  summary: string;
  sourceType?: string | null;
  sourceId?: string | null;
  recommendedAction?: string | null;
  actionRoute?: string | null;
  metadata?: Record<string, unknown>;
};

export type CopilotActionType =
  | "create_task"
  | "create_follow_up"
  | "create_purchasing_reminder"
  | "draft_production_note"
  | "draft_customer_follow_up_note"
  | "draft_catering_quote_follow_up"
  | "draft_route_issue_task"
  | "suggest_menu_adjustment"
  | "suggest_ingredient_demand_run"
  | "suggest_report_export";

export type CopilotActionDraftSeed = {
  actionType: CopilotActionType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
};

export type CopilotNarrativeStatus =
  | "OK"
  | "DISABLED_BY_SETTINGS"
  | "MISSING_API_KEY"
  | "PROVIDER_ERROR"
  | "REDACTION_BLOCKED";

export type CopilotNarrativeResult = {
  status: CopilotNarrativeStatus;
  text: string | null;
  modelUsed?: string;
};
