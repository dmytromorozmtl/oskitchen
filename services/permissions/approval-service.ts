import type { ApprovalStatus, SensitiveAction } from "@/lib/permissions/approval-rules";
import { DEFAULT_APPROVAL_TTL_HOURS, approvalStatusForAction } from "@/lib/permissions/approval-rules";

export type ApprovalEvaluation = {
  status: ApprovalStatus;
  expiresInHours: number | null;
  /** Human-readable guidance for UI — not a persisted approval ticket. */
  notes: string;
};

/**
 * Evaluates whether an approval gate should be shown.
 * This does **not** create database rows — callers must still enforce permissions independently.
 */
export function evaluateApprovalRequirement(action: SensitiveAction): ApprovalEvaluation {
  const status = approvalStatusForAction(action);
  if (status === "NOT_REQUIRED") {
    return { status, expiresInHours: null, notes: "No secondary approval required by policy." };
  }
  return {
    status,
    expiresInHours: DEFAULT_APPROVAL_TTL_HOURS,
    notes:
      "Requires owner/admin approver, written reason, and audit event before execution. Destructive retries must stay idempotent.",
  };
}

export type { ApprovalStatus, SensitiveAction } from "@/lib/permissions/approval-rules";
