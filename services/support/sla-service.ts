import type { SupportTicketPriority, SupportTicketCategory } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_FIRST_RESPONSE_SLA_MINUTES,
  DEFAULT_RESOLUTION_SLA_MINUTES,
  addMinutes,
} from "@/lib/support/support-sla";

type SlaPolicyMatchRow = {
  workspaceId: string | null;
  priority: SupportTicketPriority | null;
  category: SupportTicketCategory | null;
  firstResponseMinutes: number;
  resolutionMinutes: number;
};

function scoreSlaPolicyMatch(
  row: Pick<SlaPolicyMatchRow, "workspaceId" | "priority" | "category">,
  params: {
    workspaceId: string | null;
    priority: SupportTicketPriority;
    category: SupportTicketCategory;
  },
): number {
  let score = 0;
  if (row.workspaceId) score += 4;
  if (row.priority === params.priority) score += 2;
  if (row.category === params.category) score += 1;
  return score;
}

export function resolveSlaFirstResponseMinutesFromPolicies(
  rows: readonly SlaPolicyMatchRow[],
  params: {
    workspaceId: string | null;
    priority: SupportTicketPriority;
    category: SupportTicketCategory;
  },
): number {
  let best = rows[0];
  let bestScore = -1;
  for (const row of rows) {
    if (row.workspaceId != null && row.workspaceId !== params.workspaceId) continue;
    const score = scoreSlaPolicyMatch(row, params);
    if (score > bestScore) {
      bestScore = score;
      best = row;
    }
  }
  if (best && bestScore > 0) return best.firstResponseMinutes;
  return DEFAULT_FIRST_RESPONSE_SLA_MINUTES[params.priority];
}

export async function loadActiveSlaPolicyRows(): Promise<SlaPolicyMatchRow[]> {
  return prisma.supportSlaPolicy.findMany({
    where: { active: true },
    select: {
      workspaceId: true,
      priority: true,
      category: true,
      firstResponseMinutes: true,
      resolutionMinutes: true,
    },
  });
}

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
  let best = rows[0];
  let bestScore = -1;
  for (const r of rows) {
    const sc = scoreSlaPolicyMatch(r, params);
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
  const rows = await loadActiveSlaPolicyRows();
  return resolveSlaFirstResponseMinutesFromPolicies(rows, params);
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
