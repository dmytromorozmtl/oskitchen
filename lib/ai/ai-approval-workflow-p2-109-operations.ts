/**
 * Pure helpers for AI approval workflow (Blueprint P2-109).
 */

import { AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID } from "@/lib/ai/ai-approval-workflow-p2-109-policy";

export type AiApprovalWorkflowStageId =
  | "ai-suggest"
  | "manager-approve"
  | "system-execute"
  | "audit-log";

export type AiApprovalDraftStatus =
  | "NEEDS_APPROVAL"
  | "DRAFT"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTED"
  | "CANCELLED";

export type AiApprovalWorkflowStep = {
  stageId: AiApprovalWorkflowStageId;
  stageLabel: string;
  draftId: string;
  draftTitle: string;
  status: AiApprovalDraftStatus;
  completed: boolean;
  actor: string;
  timestamp: string;
  auditEvent: string | null;
};

export type AiApprovalAuditEntry = {
  id: string;
  eventType: string;
  draftId: string | null;
  actor: string;
  timestamp: string;
  summary: string;
};

export type AiApprovalWorkflowReport = {
  policyId: typeof AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID;
  stageCount: number;
  pendingCount: number;
  approvedCount: number;
  executedCount: number;
  auditEventCount: number;
  steps: AiApprovalWorkflowStep[];
  auditTrail: AiApprovalAuditEntry[];
};

const STAGE_LABELS: Record<AiApprovalWorkflowStageId, string> = {
  "ai-suggest": "AI suggests",
  "manager-approve": "Manager approves",
  "system-execute": "System executes",
  "audit-log": "Audit log",
};

export function mapDraftStatusToStage(status: string): AiApprovalWorkflowStageId {
  if (status === "NEEDS_APPROVAL" || status === "DRAFT") return "ai-suggest";
  if (status === "APPROVED") return "manager-approve";
  if (status === "EXECUTED") return "system-execute";
  return "audit-log";
}

export function isStageComplete(status: AiApprovalDraftStatus, stageId: AiApprovalWorkflowStageId): boolean {
  if (stageId === "ai-suggest") {
    return ["NEEDS_APPROVAL", "DRAFT", "APPROVED", "EXECUTED"].includes(status);
  }
  if (stageId === "manager-approve") {
    return ["APPROVED", "EXECUTED"].includes(status);
  }
  if (stageId === "system-execute") {
    return status === "EXECUTED";
  }
  return status === "EXECUTED" || status === "REJECTED";
}

export function validateApprovalTransition(
  from: AiApprovalDraftStatus,
  to: AiApprovalDraftStatus,
): { allowed: boolean; reason: string | null } {
  const allowed: Record<AiApprovalDraftStatus, AiApprovalDraftStatus[]> = {
    NEEDS_APPROVAL: ["APPROVED", "REJECTED", "CANCELLED"],
    DRAFT: ["NEEDS_APPROVAL", "APPROVED", "REJECTED", "CANCELLED"],
    APPROVED: ["EXECUTED", "CANCELLED"],
    REJECTED: [],
    EXECUTED: [],
    CANCELLED: [],
  };

  if (allowed[from]?.includes(to)) {
    return { allowed: true, reason: null };
  }
  return { allowed: false, reason: `Cannot transition from ${from} to ${to}` };
}

export function buildApprovalWorkflowStep(input: {
  draftId: string;
  draftTitle: string;
  status: AiApprovalDraftStatus;
  stageId: AiApprovalWorkflowStageId;
  actor: string;
  timestamp: string;
  auditEvent?: string | null;
}): AiApprovalWorkflowStep {
  return {
    stageId: input.stageId,
    stageLabel: STAGE_LABELS[input.stageId],
    draftId: input.draftId,
    draftTitle: input.draftTitle,
    status: input.status,
    completed: isStageComplete(input.status, input.stageId),
    actor: input.actor,
    timestamp: input.timestamp,
    auditEvent: input.auditEvent ?? null,
  };
}

export function buildApprovalAuditEntry(input: {
  id: string;
  eventType: string;
  draftId?: string | null;
  actor: string;
  timestamp: string;
  summary: string;
}): AiApprovalAuditEntry {
  return {
    id: input.id,
    eventType: input.eventType,
    draftId: input.draftId ?? null,
    actor: input.actor,
    timestamp: input.timestamp,
    summary: input.summary,
  };
}

export const AI_APPROVAL_WORKFLOW_DEMO_DRAFTS = [
  {
    id: "draft-po-001",
    title: "Create PO — chicken restock",
    status: "EXECUTED" as const,
    actor: "co-pilot@demo",
    createdAt: "2026-06-08T14:00:00.000Z",
    approvedAt: "2026-06-08T14:15:00.000Z",
    executedAt: "2026-06-08T14:16:00.000Z",
  },
  {
    id: "draft-sched-002",
    title: "Draft schedule — Friday dinner",
    status: "APPROVED" as const,
    actor: "co-pilot@demo",
    createdAt: "2026-06-09T09:00:00.000Z",
    approvedAt: "2026-06-09T09:30:00.000Z",
    executedAt: null,
  },
  {
    id: "draft-margin-003",
    title: "Flag low margin — house fries",
    status: "NEEDS_APPROVAL" as const,
    actor: "co-pilot@demo",
    createdAt: "2026-06-09T11:00:00.000Z",
    approvedAt: null,
    executedAt: null,
  },
] as const;

export const AI_APPROVAL_WORKFLOW_DEMO_AUDIT = [
  {
    id: "audit-001",
    eventType: "action_draft_created",
    draftId: "draft-po-001",
    actor: "co-pilot@demo",
    timestamp: "2026-06-08T14:00:00.000Z",
    summary: "Create PO — chicken restock",
  },
  {
    id: "audit-002",
    eventType: "action_draft_approved",
    draftId: "draft-po-001",
    actor: "manager@demo",
    timestamp: "2026-06-08T14:15:00.000Z",
    summary: "Approved by manager",
  },
  {
    id: "audit-003",
    eventType: "action_draft_executed",
    draftId: "draft-po-001",
    actor: "system",
    timestamp: "2026-06-08T14:16:00.000Z",
    summary: "PO draft marked executed",
  },
  {
    id: "audit-004",
    eventType: "action_draft_created",
    draftId: "draft-sched-002",
    actor: "co-pilot@demo",
    timestamp: "2026-06-09T09:00:00.000Z",
    summary: "Draft schedule — Friday dinner",
  },
  {
    id: "audit-005",
    eventType: "action_draft_approved",
    draftId: "draft-sched-002",
    actor: "manager@demo",
    timestamp: "2026-06-09T09:30:00.000Z",
    summary: "Approved by manager",
  },
] as const;

export function buildApprovalWorkflowStepsFromDrafts(
  drafts: ReadonlyArray<{
    id: string;
    title: string;
    status: string;
    actor: string;
    timestamp: string;
  }>,
): AiApprovalWorkflowStep[] {
  return drafts.flatMap((draft) => {
    const status = draft.status as AiApprovalDraftStatus;
    const stages: AiApprovalWorkflowStageId[] = [
      "ai-suggest",
      "manager-approve",
      "system-execute",
      "audit-log",
    ];
    return stages.map((stageId) =>
      buildApprovalWorkflowStep({
        draftId: draft.id,
        draftTitle: draft.title,
        status,
        stageId,
        actor: draft.actor,
        timestamp: draft.timestamp,
        auditEvent:
          stageId === "ai-suggest"
            ? "action_draft_created"
            : stageId === "manager-approve"
              ? "action_draft_approved"
              : stageId === "system-execute"
                ? "action_draft_executed"
                : "recordCopilotAudit",
      }),
    );
  });
}

export function buildApprovalWorkflowReport(input: {
  steps: AiApprovalWorkflowStep[];
  auditTrail: AiApprovalAuditEntry[];
}): AiApprovalWorkflowReport {
  const uniqueDrafts = new Set(input.steps.map((s) => s.draftId));
  const statuses = input.steps.filter((s) => s.stageId === "ai-suggest");

  return {
    policyId: AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID,
    stageCount: 4,
    pendingCount: statuses.filter((s) => s.status === "NEEDS_APPROVAL" || s.status === "DRAFT").length,
    approvedCount: statuses.filter((s) => s.status === "APPROVED").length,
    executedCount: statuses.filter((s) => s.status === "EXECUTED").length,
    auditEventCount: input.auditTrail.length,
    steps: input.steps,
    auditTrail: input.auditTrail,
  };
}

export function buildApprovalWorkflowDemoReport(): AiApprovalWorkflowReport {
  const steps = AI_APPROVAL_WORKFLOW_DEMO_DRAFTS.flatMap((draft) => {
    const stages: AiApprovalWorkflowStageId[] = [
      "ai-suggest",
      "manager-approve",
      "system-execute",
      "audit-log",
    ];
    return stages.map((stageId) =>
      buildApprovalWorkflowStep({
        draftId: draft.id,
        draftTitle: draft.title,
        status: draft.status,
        stageId,
        actor: draft.actor,
        timestamp: draft.createdAt,
        auditEvent:
          stageId === "ai-suggest"
            ? "action_draft_created"
            : stageId === "manager-approve"
              ? "action_draft_approved"
              : stageId === "system-execute"
                ? "action_draft_executed"
                : "recordCopilotAudit",
      }),
    );
  });

  const auditTrail = AI_APPROVAL_WORKFLOW_DEMO_AUDIT.map((entry) =>
    buildApprovalAuditEntry(entry),
  );

  return buildApprovalWorkflowReport({ steps, auditTrail });
}
