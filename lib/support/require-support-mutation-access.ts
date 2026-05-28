import type { SupportTicket } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import {
  requireWorkspacePermissionActor,
  type WorkspacePermissionActor,
} from "@/lib/permissions/require-workspace-permission";
import {
  resolveSupportCommentPostPermission,
  type SupportCommentVisibility,
} from "@/lib/support/support-comment-guards";
import { canUseFullSupportInbox, canViewSupportTicket } from "@/lib/support/support-permissions";

export type SupportMutationActor = WorkspacePermissionActor & {
  canTriage: boolean;
};

/**
 * Platform support inbox mutations — SUPER_ADMIN / SUPPORT_ADMIN / IMPLEMENTATION_ADMIN
 * platform roles via `canUseFullSupportInbox` (documented bridge, not workspace RBAC alone).
 */
export async function requireSupportTriageAccess(input: {
  operation: string;
}): Promise<{ ok: true; actor: SupportMutationActor } | { ok: false; error: string }> {
  const actor = await requireWorkspacePermissionActor();
  const canTriage = await canUseFullSupportInbox(
    actor.sessionUserId,
    actor.email,
    actor.workspaceRole,
  );
  if (!canTriage) {
    await recordAuditLog({
      userId: actor.sessionUserId,
      workspaceId: actor.workspaceId ?? null,
      action: "support_triage.permission_denied",
      entityType: "SupportTicket",
      metadata: {
        operation: input.operation,
        bridge: "canUseFullSupportInbox",
      },
    });
    return { ok: false, error: "Only support staff can perform this action." };
  }
  return { ok: true, actor: { ...actor, canTriage: true } };
}

/** Status changes: full triage staff or the ticket assignee. */
export async function requireSupportStatusMutationAccess(
  ticket: Pick<SupportTicket, "id" | "assignedToId">,
  input: { operation: string },
): Promise<
  | { ok: true; actor: SupportMutationActor; isAssignee: boolean }
  | { ok: false; error: string }
> {
  const actor = await requireWorkspacePermissionActor();
  const canTriage = await canUseFullSupportInbox(
    actor.sessionUserId,
    actor.email,
    actor.workspaceRole,
  );
  const isAssignee = ticket.assignedToId === actor.sessionUserId;
  if (!canTriage && !isAssignee) {
    await recordAuditLog({
      userId: actor.sessionUserId,
      workspaceId: actor.workspaceId ?? null,
      action: "support_ticket.permission_denied",
      entityType: "SupportTicket",
      entityId: ticket.id,
      metadata: {
        operation: input.operation,
        bridge: "canUseFullSupportInbox|assignee",
      },
    });
    return {
      ok: false,
      error: "Only support staff or the assigned owner can change status.",
    };
  }
  return { ok: true, actor: { ...actor, canTriage }, isAssignee };
}

/** Comment posts: visibility policy + ticket view / triage bridge (`resolveSupportCommentPostPermission`). */
export async function requireSupportCommentMutationAccess(
  ticket: Pick<SupportTicket, "id" | "userId" | "email" | "workspaceId" | "assignedToId">,
  input: { operation: string; visibility: SupportCommentVisibility },
): Promise<
  | { ok: true; actor: SupportMutationActor; isAssignee: boolean }
  | { ok: false; error: string }
> {
  const actor = await requireWorkspacePermissionActor();
  const canTriage = await canUseFullSupportInbox(
    actor.sessionUserId,
    actor.email,
    actor.workspaceRole,
  );
  const canView = await canViewSupportTicket(
    actor.sessionUserId,
    actor.email,
    ticket,
    actor.workspaceRole,
  );
  const policy = resolveSupportCommentPostPermission({
    visibility: input.visibility,
    canTriage,
    canViewTicket: canView,
  });
  if (!policy.ok) {
    await recordAuditLog({
      userId: actor.sessionUserId,
      workspaceId: actor.workspaceId ?? null,
      action: "support_comment.permission_denied",
      entityType: "SupportTicket",
      entityId: ticket.id,
      metadata: {
        operation: input.operation,
        visibility: input.visibility,
        reason: policy.error,
        bridge: "resolveSupportCommentPostPermission",
      },
    });
    if (policy.error === "INTERNAL_NOT_ALLOWED") {
      return { ok: false, error: "Internal notes are restricted to support staff." };
    }
    return { ok: false, error: "Forbidden." };
  }
  const isAssignee = ticket.assignedToId === actor.sessionUserId;
  return { ok: true, actor: { ...actor, canTriage }, isAssignee };
}
