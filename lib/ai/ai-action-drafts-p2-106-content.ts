import {
  AI_ACTION_DRAFTS_P2_106_CAPABILITY_COUNT,
  AI_ACTION_DRAFTS_P2_106_COPILOT_ROUTE,
  AI_ACTION_DRAFTS_P2_106_DRAFTS_ROUTE,
  AI_ACTION_DRAFTS_P2_106_ROUTE,
} from "@/lib/ai/ai-action-drafts-p2-106-policy";

export const AI_ACTION_DRAFTS_P2_106_EYEBROW =
  "AI action drafts · operator-approved suggestions" as const;

export const AI_ACTION_DRAFTS_P2_106_HEADLINE =
  "Five copilot draft types — PO, margin flag, schedule, briefing, commission spike" as const;

export const AI_ACTION_DRAFTS_P2_106_SUBLINE =
  "Three draft categories — purchasing & schedule, margin & commission alerts, and daily briefing narratives. BETA: verify before approve — typical directional suggestions, not certified autonomous actions." as const;

export const AI_ACTION_DRAFTS_P2_106_CAPABILITIES = [
  {
    id: "purchasing-schedule",
    label: "Purchasing & schedule",
    description: "Create PO and Draft schedule — human approves before execution.",
    module: "lib/ai/ai-action-drafts-p2-106-operations.ts",
    route: AI_ACTION_DRAFTS_P2_106_ROUTE,
  },
  {
    id: "margin-commission",
    label: "Margin & commission",
    description: "Flag low margin and Commission spike — alert drafts with source data.",
    module: "services/ai/co-pilot-service.ts",
    route: AI_ACTION_DRAFTS_P2_106_COPILOT_ROUTE,
  },
  {
    id: "daily-briefing",
    label: "Daily briefing",
    description: "Daily briefing narrative draft — yesterday stats, channel mix, next steps.",
    module: "services/ai/copilot-service.ts",
    route: AI_ACTION_DRAFTS_P2_106_DRAFTS_ROUTE,
  },
] as const;

export const AI_ACTION_DRAFTS_P2_106_OPERATOR_LINKS = [
  { label: "Co-Pilot hub", href: AI_ACTION_DRAFTS_P2_106_COPILOT_ROUTE },
  { label: "Action drafts queue", href: AI_ACTION_DRAFTS_P2_106_DRAFTS_ROUTE },
  { label: "Today briefing", href: "/dashboard/today" },
] as const;

export { AI_ACTION_DRAFTS_P2_106_CAPABILITY_COUNT, AI_ACTION_DRAFTS_P2_106_ROUTE };
