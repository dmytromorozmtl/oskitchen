import type { PlatformRole, SupportTicket, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";

const SUPPORT_TRIAGE_PLATFORM_ROLES: PlatformRole[] = [
  "SUPER_ADMIN",
  "PLATFORM_ADMIN",
  "SUPPORT_ADMIN",
  "IMPLEMENTATION_ADMIN",
];

export async function canUseFullSupportInbox(
  userId: string,
  email: string | null | undefined,
  profileRole: UserRole,
): Promise<boolean> {
  void profileRole;
  if (await isSuperAdminUser(userId, email)) return true;
  const row = await prisma.platformUserRole.findFirst({
    where: { userId, role: { in: SUPPORT_TRIAGE_PLATFORM_ROLES } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function userWorkspaceIds(userId: string): Promise<string[]> {
  const owned = await prisma.workspace.findMany({
    where: { ownerUserId: userId, active: true },
    select: { id: true },
  });
  const member = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  });
  const ids = new Set<string>();
  for (const w of owned) ids.add(w.id);
  for (const m of member) ids.add(m.workspaceId);
  return [...ids];
}

/**
 * Whether the user may read this ticket (row-level).
 * Full triage: all tickets. Otherwise: submitter match, email match, or workspace membership.
 */
export async function canViewSupportTicket(
  userId: string,
  email: string | null | undefined,
  ticket: Pick<SupportTicket, "userId" | "email" | "workspaceId">,
  profileRole: UserRole,
): Promise<boolean> {
  if (await canUseFullSupportInbox(userId, email, profileRole)) return true;
  if (ticket.userId && ticket.userId === userId) return true;
  const em = (email ?? "").trim().toLowerCase();
  if (em && ticket.email.trim().toLowerCase() === em) return true;
  if (!ticket.workspaceId) return false;
  const wsIds = await userWorkspaceIds(userId);
  return wsIds.includes(ticket.workspaceId);
}

export async function canMutateSupportTicket(
  userId: string,
  email: string | null | undefined,
  ticket: Pick<SupportTicket, "userId" | "email" | "workspaceId" | "assignedToId">,
  profileRole: UserRole,
): Promise<boolean> {
  if (await canUseFullSupportInbox(userId, email, profileRole)) return true;
  if (ticket.assignedToId === userId) return true;
  return canViewSupportTicket(userId, email, ticket, profileRole);
}
