import { prisma } from "@/lib/prisma";

import type { ActivityTimelineItem } from "@/lib/activity/activity-types";

const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  ORDER_CREATED: "Order created",
  POS_CHECKOUT_COMPLETED: "POS checkout completed",
  POS_CHECKOUT_CUSTOMER_LINKED: "POS sale linked to CRM customer",
  POS_PAYMENT_RECORDED: "POS payment recorded",
  POS_RECEIPT_CREATED: "POS receipt created",
  ORDER_STATUS_CHANGED: "Order status changed",
  ORDER_CONFIRMED: "Order confirmed",
  ORDER_CANCELLED: "Order cancelled",
  PRODUCT_MAPPING_APPROVED: "Product mapping approved",
  CHANNEL_IMPORT_COMPLETED: "Channel import completed",
  WEBHOOK_RECEIVED: "Webhook received",
  SUPPORT_TICKET_CREATED: "Support ticket created",
  SUPPORT_TICKET_UPDATED: "Support ticket updated",
};

function humanizeActivityAction(action: string): string {
  return ACTIVITY_ACTION_LABELS[action] ?? action.replace(/_/g, " ");
}

function mapRow(r: {
  id: string;
  action: string;
  entityType: string;
  entityLabel: string | null;
  severity: string | null;
  source: string | null;
  createdAt: Date;
  route: string | null;
}): ActivityTimelineItem {
  return {
    id: r.id,
    title: humanizeActivityAction(r.action),
    subtitle: [r.entityType, r.entityLabel, r.source].filter(Boolean).join(" · ") || null,
    createdAt: r.createdAt.toISOString(),
    severity: r.severity,
    href: r.route?.startsWith("/") ? r.route : null,
  };
}

export async function listActivityForEntity(
  userId: string,
  entityId: string,
  take = 40,
): Promise<ActivityTimelineItem[]> {
  const rows = await prisma.auditLog.findMany({
    where: {
      userId,
      entityId,
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityLabel: true,
      severity: true,
      source: true,
      createdAt: true,
      route: true,
    },
  });
  return rows.map(mapRow);
}

export async function listRecentWorkspaceActivity(
  userId: string,
  take = 30,
): Promise<ActivityTimelineItem[]> {
  const { auditLogListWhereForOwner } = await import("@/lib/scope/workspace-resource-scope");
  const scope = await auditLogListWhereForOwner(userId);
  const rows = await prisma.auditLog.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityLabel: true,
      severity: true,
      source: true,
      createdAt: true,
      route: true,
    },
  });
  return rows.map(mapRow);
}
