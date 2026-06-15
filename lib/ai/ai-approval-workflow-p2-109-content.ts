import {
  AI_APPROVAL_WORKFLOW_P2_109_ACTION_DRAFTS_ROUTE,
  AI_APPROVAL_WORKFLOW_P2_109_COPILOT_DRAFTS_ROUTE,
  AI_APPROVAL_WORKFLOW_P2_109_ROUTE,
  AI_APPROVAL_WORKFLOW_P2_109_STAGE_COUNT,
} from "@/lib/ai/ai-approval-workflow-p2-109-policy";

export const AI_APPROVAL_WORKFLOW_P2_109_EYEBROW =
  "AI approval workflow · human-in-the-loop" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_HEADLINE =
  "AI suggests → manager approves → system executes → audit log" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_SUBLINE =
  "Four-stage approval chain for AI action drafts — Co-Pilot suggests, manager approves, system executes with minimal side effects, and every step is recorded in the audit log. BETA: verify approvals against your policy — typical directional workflow, not certified compliance audit." as const;

export const AI_APPROVAL_WORKFLOW_P2_109_STAGES = [
  {
    id: "ai-suggest",
    label: "AI suggests",
    description: "Co-Pilot creates action draft with NEEDS_APPROVAL status and source payload.",
    module: "services/ai/copilot-service.ts",
    route: AI_APPROVAL_WORKFLOW_P2_109_ACTION_DRAFTS_ROUTE,
    auditEvent: "action_draft_created",
  },
  {
    id: "manager-approve",
    label: "Manager approves",
    description: "Manager reviews draft and sets status to APPROVED — reject path available.",
    module: "actions/copilot.ts",
    route: AI_APPROVAL_WORKFLOW_P2_109_COPILOT_DRAFTS_ROUTE,
    auditEvent: "action_draft_approved",
  },
  {
    id: "system-execute",
    label: "System executes",
    description: "Approved draft runs through executeApprovedAction with recorded summary.",
    module: "services/ai/co-pilot-service.ts",
    route: AI_APPROVAL_WORKFLOW_P2_109_ROUTE,
    auditEvent: "action_draft_executed",
  },
  {
    id: "audit-log",
    label: "Audit log",
    description: "Every suggest, approve, reject, and execute event persisted to CopilotAuditEvent.",
    module: "services/ai/copilot-service.ts",
    route: AI_APPROVAL_WORKFLOW_P2_109_ROUTE,
    auditEvent: "recordCopilotAudit",
  },
] as const;

export const AI_APPROVAL_WORKFLOW_P2_109_OPERATOR_LINKS = [
  { label: "Action drafts", href: AI_APPROVAL_WORKFLOW_P2_109_ACTION_DRAFTS_ROUTE },
  { label: "Drafts queue", href: AI_APPROVAL_WORKFLOW_P2_109_COPILOT_DRAFTS_ROUTE },
  { label: "Benchmark suite", href: "/dashboard/ai/benchmark-suite" },
] as const;

export { AI_APPROVAL_WORKFLOW_P2_109_ROUTE, AI_APPROVAL_WORKFLOW_P2_109_STAGE_COUNT };
