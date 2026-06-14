import type { Prisma } from "@prisma/client";

import type { SupportTicketFilters } from "@/lib/support/support-types";
import { isOpenSupportStatus, OPEN_SUPPORT_TICKET_STATUSES } from "@/lib/support/support-status";

export function buildSupportTicketWhere(
  base: Prisma.SupportTicketWhereInput,
  filters: SupportTicketFilters,
): Prisma.SupportTicketWhereInput {
  const and: Prisma.SupportTicketWhereInput[] = [base];
  if (filters.status) {
    and.push({
      status: Array.isArray(filters.status) ? { in: filters.status } : filters.status,
    });
  }
  if (filters.category) {
    and.push({
      category: Array.isArray(filters.category) ? { in: filters.category } : filters.category,
    });
  }
  if (filters.priority) {
    and.push({
      priority: Array.isArray(filters.priority) ? { in: filters.priority } : filters.priority,
    });
  }
  if (filters.workspaceId) {
    and.push({ workspaceId: filters.workspaceId });
  }
  if (filters.assignedToId === "unassigned") {
    and.push({ assignedToId: null });
  } else if (filters.assignedToId && filters.assignedToId !== "me") {
    and.push({ assignedToId: filters.assignedToId });
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { subject: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (filters.overdueSla) {
    and.push({
      slaDueAt: { lt: new Date() },
      status: { in: [...OPEN_SUPPORT_TICKET_STATUSES] },
    });
  }
  if (filters.createdAfter) {
    and.push({ createdAt: { gte: filters.createdAfter } });
  }
  if (filters.createdBefore) {
    and.push({ createdAt: { lte: filters.createdBefore } });
  }
  return { AND: and };
}

export function openTicketWhere(): Prisma.SupportTicketWhereInput {
  return {
    status: { in: [...OPEN_SUPPORT_TICKET_STATUSES] },
  };
}

export function isTicketConsideredOpenForKpi(status: Parameters<typeof isOpenSupportStatus>[0]): boolean {
  return isOpenSupportStatus(status);
}
