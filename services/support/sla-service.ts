import type { SupportTicketPriority, SupportTicketCategory } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_FIRST_RESPONSE_SLA_MINUTES,
  DEFAULT_RESOLUTION_SLA_MINUTES,
  addMinutes,
} from "@/lib/support/support-sla";

export async function resolveSlaResolutionMinutes(params: {
  workspaceId: string | null;
  priority: SupportTicketPriority;
  category: SupportTicketCategory;
}): Promise<number> {
  const rows = await prisma.supportSlaPolicy.findMany({
    where: {
      active: true,
      OR: [{ workspaceId: null }, ...(params.workspaceId ? [{ workspaceId: params.workspaceId }] : [])],
    },
  });
  const score = (r: { workspaceId: string | null; priority: SupportTicketPriority | null; category: SupportTicketCategory | null }) => {
    let s = 0;
    if (r.workspaceId) s += 4;
    if (r.priority === params.priority) s += 2;
    if (r.category === params.category) s += 1;
    return s;
  };
  let best = rows[0];
  let bestScore = -1;
  for (const r of rows) {
    const sc = score(r);
    if (sc > bestScore) {
      bestScore = sc;
      best = r;
    }
  }
  if (best && bestScore > 0) return best.resolutionMinutes;
  return DEFAULT_RESOLUTION_SLA_MINUTES[params.priority];
}

export async function resolveSlaFirstResponseMinutes(params: {
  workspaceId: string | null;
  priority: SupportTicketPriority;
  category: SupportTicketCategory;
}): Promise<number> {
  const rows = await prisma.supportSlaPolicy.findMany({
    where: {
      active: true,
      OR: [{ workspaceId: null }, ...(params.workspaceId ? [{ workspaceId: params.workspaceId }] : [])],
    },
  });
  const score = (r: { workspaceId: string | null; priority: SupportTicketPriority | null; category: SupportTicketCategory | null }) => {
    let s = 0;
    if (r.workspaceId) s += 4;
    if (r.priority === params.priority) s += 2;
    if (r.category === params.category) s += 1;
    return s;
  };
  let best = rows[0];
  let bestScore = -1;
  for (const r of rows) {
    const sc = score(r);
    if (sc > bestScore) {
      bestScore = sc;
      best = r;
    }
  }
  if (best && bestScore > 0) return best.firstResponseMinutes;
  return DEFAULT_FIRST_RESPONSE_SLA_MINUTES[params.priority];
}

export async function computeSlaDueAt(params: {
  createdAt: Date;
  workspaceId: string | null;
  priority: SupportTicketPriority;
  category: SupportTicketCategory;
}): Promise<Date> {
  const mins = await resolveSlaResolutionMinutes({
    workspaceId: params.workspaceId,
    priority: params.priority,
    category: params.category,
  });
  return addMinutes(params.createdAt, mins);
}
