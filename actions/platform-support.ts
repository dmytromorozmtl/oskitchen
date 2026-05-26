"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { recordPlatformAudit } from "@/lib/platform-audit";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { prisma } from "@/lib/prisma";
import {
  SupportCommentAuthorType,
  SupportCommentVisibility,
  SupportTicketEventType,
  SupportTicketStatus,
} from "@prisma/client";

export async function addPlatformSupportInternalCommentAction(formData: FormData): Promise<void> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support:reply");
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!ticketId || !message) return;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { workspaceId: true },
  });

  await prisma.supportTicketComment.create({
    data: {
      ticketId,
      authorUserId: ctx.userId,
      authorType: SupportCommentAuthorType.USER,
      visibility: SupportCommentVisibility.INTERNAL,
      message: message.slice(0, 20000),
    },
  });

  await prisma.supportTicketEvent.create({
    data: {
      ticketId,
      eventType: SupportTicketEventType.COMMENT_ADDED,
      performedById: ctx.userId,
      metadataJson: { platform: true, internal: true },
    },
  });

  await recordPlatformAudit({
    adminUserId: ctx.userId,
    action: "platform.support.internal_comment",
    entityType: "support_ticket",
    entityId: ticketId,
    targetWorkspaceId: ticket?.workspaceId ?? null,
    metadata: { length: message.length },
  });

  revalidatePath("/platform/support");
  revalidatePath(`/platform/support/${ticketId}`);
}

export async function addPlatformSupportCustomerReplyAction(formData: FormData): Promise<void> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support:reply");
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!ticketId || !message) return;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { workspaceId: true, status: true },
  });
  if (!ticket) return;

  await prisma.supportTicketComment.create({
    data: {
      ticketId,
      authorUserId: ctx.userId,
      authorType: SupportCommentAuthorType.USER,
      visibility: SupportCommentVisibility.CUSTOMER,
      message: message.slice(0, 20000),
    },
  });

  await prisma.supportTicketEvent.create({
    data: {
      ticketId,
      eventType: SupportTicketEventType.COMMENT_ADDED,
      performedById: ctx.userId,
      metadataJson: { platform: true, visibility: "CUSTOMER" },
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      lastStaffReplyAt: new Date(),
      status: ticket.status === "WAITING_ON_CUSTOMER" ? "WAITING_ON_SUPPORT" : ticket.status,
    },
  });

  await recordPlatformAudit({
    adminUserId: ctx.userId,
    action: "platform.support.customer_reply",
    entityType: "support_ticket",
    entityId: ticketId,
    targetWorkspaceId: ticket.workspaceId ?? null,
    metadata: { length: message.length },
  });

  revalidatePath("/platform/support");
  revalidatePath(`/platform/support/${ticketId}`);
}

const STATUS_SET = new Set<string>(Object.values(SupportTicketStatus));

export async function platformUpdateSupportTicketStatusAction(formData: FormData): Promise<void> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support:reply");
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim();
  if (!ticketId || !STATUS_SET.has(statusRaw)) return;
  const status = statusRaw as SupportTicketStatus;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { workspaceId: true, resolvedAt: true, closedAt: true, resolutionSummary: true },
  });
  if (!ticket) return;

  const now = new Date();
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      ...(status === "RESOLVED" || status === "CLOSED"
        ? {
            resolvedAt: ticket.resolvedAt ?? now,
            closedAt: status === "CLOSED" ? now : ticket.closedAt,
          }
        : {}),
    },
  });

  await prisma.supportTicketEvent.create({
    data: {
      ticketId,
      eventType: SupportTicketEventType.STATUS_CHANGED,
      performedById: ctx.userId,
      metadataJson: { platform: true, status },
    },
  });

  await recordPlatformAudit({
    adminUserId: ctx.userId,
    action: "platform.support.status_change",
    entityType: "support_ticket",
    entityId: ticketId,
    targetWorkspaceId: ticket.workspaceId ?? null,
    metadata: { status },
  });

  revalidatePath("/platform/support");
  revalidatePath(`/platform/support/${ticketId}`);
}

export async function platformAssignSupportTicketAction(formData: FormData): Promise<void> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support:assign");
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const assigneeRaw = String(formData.get("assigneeId") ?? "").trim();
  const assigneeId = assigneeRaw.length === 0 ? null : assigneeRaw;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { workspaceId: true, status: true },
  });
  if (!ticket) return;

  if (assigneeId) {
    const profile = await prisma.userProfile.findUnique({ where: { id: assigneeId }, select: { id: true } });
    if (!profile) return;
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      assignedToId: assigneeId,
      status: ticket.status === "NEW" ? "TRIAGED" : ticket.status,
    },
  });

  await prisma.supportTicketEvent.create({
    data: {
      ticketId,
      eventType: SupportTicketEventType.ASSIGNED,
      performedById: ctx.userId,
      metadataJson: { platform: true, assigneeId },
    },
  });

  await recordPlatformAudit({
    adminUserId: ctx.userId,
    action: "platform.support.assign",
    entityType: "support_ticket",
    entityId: ticketId,
    targetWorkspaceId: ticket.workspaceId ?? null,
    metadata: { assigneeId },
  });

  revalidatePath("/platform/support");
  revalidatePath(`/platform/support/${ticketId}`);
}
