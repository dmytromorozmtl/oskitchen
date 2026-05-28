"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupportTicketStatus } from "@prisma/client";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { userHasWorkspaceAccess } from "@/lib/scope/assert-user-workspace-access";
import {
  requireSupportStatusMutationAccess,
  requireSupportTriageAccess,
} from "@/lib/support/require-support-mutation-access";
import {
  canUseFullSupportInbox,
  canViewSupportTicket,
} from "@/lib/support/support-permissions";
import { resolveSupportCommentPostPermission } from "@/lib/support/support-comment-guards";
import { redactSupportJson } from "@/lib/support/support-redaction";
import { escalateSupportTicketNotify, evaluateEscalationSignals } from "@/services/support/escalation-service";
import { resolveFirstResponseStamp } from "@/services/support/support-engagement-service";
import { createSupportTicket } from "@/services/support/ticket-service";

async function sessionProfile() {
  const { sessionUser: session } = await requireTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true },
  });
  if (!profile) return null;
  return { session, profile };
}

export async function assignSupportTicket(ticketId: string, assigneeId: string | null) {
  try {
    const access = await requireSupportTriageAccess({ operation: "support.assign" });
    if (!access.ok) return { error: access.error };
    const { actor } = access;
    const session = actor.sessionUser;
    const triage = access.actor.canTriage;
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { error: "Ticket not found." };
    const now = new Date();
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToId: assigneeId,
        status: ticket.status === "NEW" ? "TRIAGED" : ticket.status,
        firstResponseAt: resolveFirstResponseStamp(
          {
            firstResponseAt: ticket.firstResponseAt,
            actorCanTriage: triage,
            actorIsAssignedOwner: ticket.assignedToId === session.id,
          },
          now,
        ),
      },
    });
    try {
      await prisma.supportTicketEvent.create({
        data: {
          ticketId,
          eventType: "ASSIGNED",
          performedById: session.id,
          metadataJson: { assigneeId },
        },
      });
    } catch {
      /* support_ticket_events table may not exist until migration */
    }
    revalidatePath("/dashboard/support");
    revalidatePath(`/dashboard/support/${ticketId}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
  resolutionSummary?: string,
) {
  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { error: "Ticket not found." };
    const access = await requireSupportStatusMutationAccess(ticket, {
      operation: "support.status_update",
    });
    if (!access.ok) return { error: access.error };
    const { actor, isAssignee } = access;
    const session = actor.sessionUser;
    const triage = actor.canTriage;
    const now = new Date();
    const data = {
      status,
      firstResponseAt: resolveFirstResponseStamp(
        {
          firstResponseAt: ticket.firstResponseAt,
          actorCanTriage: triage,
          actorIsAssignedOwner: isAssignee,
        },
        now,
      ),
      ...(status === "RESOLVED" || status === "CLOSED"
        ? {
            resolvedAt: ticket.resolvedAt ?? now,
            closedAt: status === "CLOSED" ? now : ticket.closedAt,
            resolutionSummary: resolutionSummary?.trim() || ticket.resolutionSummary,
          }
        : {}),
    };
    await prisma.supportTicket.update({ where: { id: ticketId }, data });
    await prisma.supportTicketEvent.create({
      data: {
        ticketId,
        eventType: "STATUS_CHANGED",
        performedById: session.id,
        metadataJson: { status },
      },
    });
    revalidatePath("/dashboard/support");
    revalidatePath(`/dashboard/support/${ticketId}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function addSupportTicketComment(input: {
  ticketId: string;
  message: string;
  visibility: "INTERNAL" | "CUSTOMER" | "PARTNER";
}) {
  try {
    const ctx = await sessionProfile();
    if (!ctx) return { error: "Unauthorized." };
    const { session, profile } = ctx;
    const ticket = await prisma.supportTicket.findUnique({ where: { id: input.ticketId } });
    if (!ticket) return { error: "Ticket not found." };
    const triage = await canUseFullSupportInbox(session.id, session.email, profile.role);
    const canView = await canViewSupportTicket(session.id, session.email, ticket, profile.role);
    const isAssignee = ticket.assignedToId === session.id;
    const policy = resolveSupportCommentPostPermission({
      visibility: input.visibility,
      canTriage: triage,
      canViewTicket: canView,
    });
    if (!policy.ok) {
      if (policy.error === "INTERNAL_NOT_ALLOWED") {
        return { error: "Internal notes are restricted to support staff." };
      }
      return { error: "Forbidden." };
    }
    await prisma.supportTicketComment.create({
      data: {
        ticketId: input.ticketId,
        authorUserId: session.id,
        authorType: "USER",
        visibility: input.visibility,
        message: input.message.trim(),
      },
    });
    await prisma.supportTicketEvent.create({
      data: {
        ticketId: input.ticketId,
        eventType: "COMMENT_ADDED",
        performedById: session.id,
        metadataJson: { visibility: input.visibility },
      },
    });
    const now = new Date();
    const firstResponseAt = resolveFirstResponseStamp(
      {
        firstResponseAt: ticket.firstResponseAt,
        actorCanTriage: triage,
        actorIsAssignedOwner: isAssignee,
      },
      now,
    );
    if (input.visibility === "CUSTOMER") {
      await prisma.supportTicket.update({
        where: { id: input.ticketId },
        data: {
          firstResponseAt,
          lastStaffReplyAt: now,
          status: ticket.status === "WAITING_ON_CUSTOMER" ? "WAITING_ON_SUPPORT" : ticket.status,
        },
      });
    } else if (firstResponseAt && !ticket.firstResponseAt) {
      await prisma.supportTicket.update({
        where: { id: input.ticketId },
        data: {
          firstResponseAt,
        },
      });
    }
    revalidatePath("/dashboard/support");
    revalidatePath(`/dashboard/support/${input.ticketId}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function escalateSupportTicketAction(ticketId: string) {
  try {
    const access = await requireSupportTriageAccess({ operation: "support.escalate" });
    if (!access.ok) return { error: access.error };
    const { actor } = access;
    const session = actor.sessionUser;
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { error: "Ticket not found." };
    const reasons = evaluateEscalationSignals(ticket);
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "ESCALATED", escalatedAt: new Date() },
    });
    await prisma.supportTicketEvent.create({
      data: {
        ticketId,
        eventType: "ESCALATED",
        performedById: session.id,
        metadataJson: { reasons },
      },
    });
    void escalateSupportTicketNotify({ ticket, reasons });
    revalidatePath("/dashboard/support");
    revalidatePath(`/dashboard/support/${ticketId}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function bulkAssignSupportTickets(ticketIds: string[], assigneeId: string | null) {
  for (const id of ticketIds) {
    await assignSupportTicket(id, assigneeId);
  }
  return { ok: true as const };
}

const dashboardCategory = z.enum([
  "BILLING",
  "TECHNICAL",
  "INTEGRATION",
  "ONBOARDING",
  "FEATURE_REQUEST",
  "BUG",
  "OTHER",
  "DATA_IMPORT",
  "PRODUCT_MAPPING",
  "STOREFRONT",
  "PRODUCTION",
  "PACKING",
  "ROUTES",
  "NOTIFICATIONS",
  "ACCOUNT_ACCESS",
  "SECURITY",
]);

const dashboardPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]);

const dashboardSeverity = z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]);

export async function submitDashboardSupportTicketForm(
  _prev: { error?: string; ok?: boolean; ticketRef?: string; ticketId?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean; ticketRef?: string; ticketId?: string }> {
  try {
    if (String(formData.get("company_hp") ?? "").trim()) return { ok: true as const, ticketRef: "" };
    const { sessionUser: session } = await requireTenantActor();
    const wsRaw = String(formData.get("workspaceId") ?? "").trim();
    const workspaceId = wsRaw.length > 0 ? wsRaw : null;
    if (workspaceId) {
      if (!(await userHasWorkspaceAccess(session.id, workspaceId))) {
        return { error: "Invalid workspace selection." };
      }
    }
    let browserParsed: unknown = undefined;
    const browserRaw = String(formData.get("browserInfoJson") ?? "").trim();
    if (browserRaw) {
      try {
        browserParsed = JSON.parse(browserRaw) as unknown;
      } catch {
        return { error: "Browser info must be valid JSON." };
      }
    }
    const parsed = z
      .object({
        email: z.string().email(),
        requesterName: z.string().max(255).optional().or(z.literal("")),
        subject: z.string().min(2).max(255),
        message: z.string().min(10).max(8000),
        category: dashboardCategory,
        priority: dashboardPriority,
        severity: dashboardSeverity.optional(),
        moduleKey: z.string().max(80).optional().or(z.literal("")),
        relatedEntityType: z.string().max(80).optional().or(z.literal("")),
        relatedEntityId: z.string().max(255).optional().or(z.literal("")),
        diagnosticsConsent: z.coerce.boolean().optional(),
      })
      .safeParse({
        email: formData.get("email"),
        requesterName: formData.get("requesterName"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        category: formData.get("category"),
        priority: formData.get("priority") || "MEDIUM",
        severity: formData.get("severity") || "MODERATE",
        moduleKey: formData.get("moduleKey"),
        relatedEntityType: formData.get("relatedEntityType"),
        relatedEntityId: formData.get("relatedEntityId"),
        diagnosticsConsent: formData.get("diagnosticsConsent") === "on",
      });
    if (!parsed.success) return { error: "Please check required fields and try again." };
    const d = parsed.data;
    const consent = d.diagnosticsConsent ?? false;
    const { ticket, ticketRef } = await createSupportTicket({
      userId: session.id,
      email: d.email.trim().toLowerCase(),
      requesterName: d.requesterName?.trim() || null,
      subject: d.subject.trim(),
      message: d.message.trim(),
      category: d.category,
      priority: d.priority,
      severity: d.severity,
      workspaceId,
      source: "DASHBOARD",
      moduleKey: d.moduleKey?.trim() || null,
      relatedEntityType: d.relatedEntityType?.trim() || null,
      relatedEntityId: d.relatedEntityId?.trim() || null,
      browserInfoJson: consent ? redactSupportJson(browserParsed ?? { note: "consent without payload" }) : undefined,
      diagnosticsConsent: consent,
    });
    revalidatePath("/dashboard/support");
    revalidatePath(`/dashboard/support/${ticket.id}`);
    return { ok: true as const, ticketRef, ticketId: ticket.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}
