import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketSeverity,
  SupportTicketSource,
  SupportTicketStatus,
} from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { redactSupportJson } from "@/lib/support/support-redaction";
import { computeSlaDueAt } from "@/services/support/sla-service";
import { trySendTicketCreatedConfirmation } from "@/services/support/support-notification-service";
import { notifyGrowthInbound } from "@/lib/growth/growth-notify";

export type CreateSupportTicketInput = {
  userId: string | null;
  email: string;
  requesterName?: string | null;
  subject: string;
  message: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  workspaceId?: string | null;
  source?: SupportTicketSource;
  moduleKey?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  browserInfoJson?: unknown;
  diagnosticsConsent?: boolean;
  attachmentsJson?: unknown;
  partnerAccountId?: string | null;
  severity?: SupportTicketSeverity;
  assignedToId?: string | null;
  initialStatus?: SupportTicketStatus;
  skipRequesterConfirmation?: boolean;
  skipInboundNotification?: boolean;
};

function ticketRefFromId(id: string) {
  return `KS-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function createSupportTicket(input: CreateSupportTicketInput) {
  const now = new Date();
  let slaDueAt: Date | null = null;
  try {
    slaDueAt = await computeSlaDueAt({
      createdAt: now,
      workspaceId: input.workspaceId ?? null,
      priority: input.priority,
      category: input.category,
    });
  } catch (e) {
    logger.warn("SLA policy lookup failed — using inline default window.", e);
    const { DEFAULT_RESOLUTION_SLA_MINUTES, addMinutes } = await import("@/lib/support/support-sla");
    slaDueAt = addMinutes(now, DEFAULT_RESOLUTION_SLA_MINUTES[input.priority]);
  }

  const browserInfo = input.browserInfoJson != null ? redactSupportJson(input.browserInfoJson) : undefined;
  const attachments = input.attachmentsJson != null ? redactSupportJson(input.attachmentsJson) : undefined;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: input.userId,
      email: input.email.trim().toLowerCase(),
      requesterName: input.requesterName?.trim() || null,
      subject: input.subject.trim(),
      message: input.message.trim(),
      category: input.category,
      priority: input.priority,
      severity: input.severity ?? "MODERATE",
      workspaceId: input.workspaceId ?? null,
      source: input.source ?? "DASHBOARD",
      moduleKey: input.moduleKey ?? null,
      relatedEntityType: input.relatedEntityType ?? null,
      relatedEntityId: input.relatedEntityId ?? null,
      browserInfoJson: browserInfo === undefined ? undefined : (browserInfo as Prisma.InputJsonValue),
      diagnosticsConsent: input.diagnosticsConsent ?? false,
      attachmentsJson: attachments === undefined ? undefined : (attachments as Prisma.InputJsonValue),
      partnerAccountId: input.partnerAccountId ?? null,
      assignedToId: input.assignedToId ?? null,
      slaDueAt,
      status: input.initialStatus ?? "NEW",
      escalatedAt: input.initialStatus === "ESCALATED" ? now : null,
    },
  });

  try {
    await prisma.supportTicketEvent.create({
      data: {
        ticketId: ticket.id,
        eventType: "CREATED",
        performedById: input.userId,
        metadataJson: { source: ticket.source, category: ticket.category, priority: ticket.priority },
      },
    });
  } catch (e) {
    logger.warn("Support ticket event log skipped (migration pending?)", e);
  }

  if (input.assignedToId) {
    try {
      await prisma.supportTicketEvent.create({
        data: {
          ticketId: ticket.id,
          eventType: "ASSIGNED",
          performedById: input.userId,
          metadataJson: { assigneeId: input.assignedToId, source: "create_support_ticket" },
        },
      });
    } catch (e) {
      logger.warn("Support ticket assignment event log skipped (migration pending?)", e);
    }
  }

  const ref = ticketRefFromId(ticket.id);
  if (!input.skipRequesterConfirmation) {
    void trySendTicketCreatedConfirmation({
      to: ticket.email,
      ticketRef: ref,
      subjectLine: ticket.subject,
    });
  }
  if (!input.skipInboundNotification) {
    void notifyGrowthInbound(
      `Support ticket ${ref}: ${ticket.subject}`,
      `${ticket.email}\n${ticket.category} / ${ticket.priority}\n\n${ticket.message.slice(0, 4000)}`,
    );
  }

  return { ticket, ticketRef: ref };
}

export async function getSupportTicketById(id: string) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: {
      workspace: { select: { id: true, name: true } },
      userProfile: { select: { id: true, fullName: true, email: true } },
      assignedTo: { select: { id: true, fullName: true, email: true } },
    },
  });
}

export type ListTicketsForUserParams = {
  userId: string;
  email: string | null | undefined;
  canTriage: boolean;
  workspaceIds: string[];
  take?: number;
  skip?: number;
  whereExtra?: Prisma.SupportTicketWhereInput;
};

export function visibleTicketsWhere(params: ListTicketsForUserParams): Prisma.SupportTicketWhereInput {
  if (params.canTriage) return params.whereExtra ?? {};
  const em = (params.email ?? "").trim().toLowerCase();
  const or: Prisma.SupportTicketWhereInput[] = [];
  if (params.userId) {
    or.push({ userId: params.userId });
  }
  if (em) {
    or.push({ email: em });
  }
  if (params.workspaceIds.length > 0) {
    or.push({ workspaceId: { in: params.workspaceIds } });
  }
  if (or.length === 0) {
    const empty: Prisma.SupportTicketWhereInput = { id: "00000000-0000-0000-0000-000000000000" };
    return params.whereExtra ? { AND: [empty, params.whereExtra] } : empty;
  }
  const base: Prisma.SupportTicketWhereInput = { OR: or };
  if (params.whereExtra) {
    return { AND: [base, params.whereExtra] };
  }
  return base;
}
