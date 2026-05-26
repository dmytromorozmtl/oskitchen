import type {
  PackingVerificationItemStatus,
  PackingVerificationSessionMode,
  PackingVerificationSessionStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { QC_EVENT } from "@/lib/packing-verification/verification-actions";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { packingScanEventListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function recordPackingScan(input: {
  userId: string;
  token: string;
  tokenType: string;
  source: string;
  success: boolean;
  errorMessage?: string | null;
}) {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  await prisma.packingScanEvent.create({
    data: {
      userId: input.userId,
      workspaceId,
      token: input.token.slice(0, 256),
      tokenType: input.tokenType.slice(0, 64),
      source: input.source.slice(0, 64),
      success: input.success,
      errorMessage: input.errorMessage?.slice(0, 2000) ?? null,
    },
  });
}

export async function listRecentScans(userId: string, take = 25) {
  const where = await packingScanEventListWhereForOwner(userId);
  return prisma.packingScanEvent.findMany({
    where,
    orderBy: { scannedAt: "desc" },
    take,
    select: {
      id: true,
      token: true,
      tokenType: true,
      source: true,
      success: true,
      errorMessage: true,
      scannedAt: true,
    },
  });
}

export async function listOpenSessions(userId: string, take = 12) {
  return prisma.packingVerificationSession.findMany({
    where: {
      userId,
      status: { in: ["OPEN", "IN_PROGRESS", "PARTIAL"] },
    },
    orderBy: { startedAt: "desc" },
    take,
    include: {
      order: { select: { id: true, customerName: true, status: true, fulfillmentType: true } },
      _count: { select: { items: true } },
    },
  });
}

export async function startOrderVerificationSession(input: {
  tenantUserId: string;
  actorUserId: string;
  orderId: string;
  mode?: PackingVerificationSessionMode;
}): Promise<{ sessionId: string; reused: boolean }> {
  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId: input.tenantUserId },
    include: {
      orderItems: { include: { product: true } },
    },
  });
  if (!order) throw new Error("ORDER_NOT_FOUND");

  const existing = await prisma.packingVerificationSession.findFirst({
    where: {
      userId: input.tenantUserId,
      orderId: order.id,
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
    orderBy: { startedAt: "desc" },
  });
  if (existing) {
    return { sessionId: existing.id, reused: true };
  }

  const tasks = await prisma.packingTask.findMany({
    where: { orderId: order.id, userId: input.tenantUserId },
    select: {
      id: true,
      orderItemId: true,
      productId: true,
      title: true,
      quantity: true,
      labelPrintedAt: true,
      requiresAllergenCheck: true,
      requiresNutritionLabel: true,
    },
  });
  const taskByOrderItem = new Map(tasks.map((t) => [t.orderItemId, t]));

  const session = await prisma.$transaction(async (tx) => {
    const s = await tx.packingVerificationSession.create({
      data: {
        userId: input.tenantUserId,
        orderId: order.id,
        mode: input.mode ?? "ORDER_VERIFY",
        status: "IN_PROGRESS",
        startedById: input.actorUserId,
      },
    });

    for (const line of order.orderItems) {
      const pt = line.id ? taskByOrderItem.get(line.id) : undefined;
      const allergens = line.product?.allergens?.trim();
      const allergenCheckStatus = allergens ? "PENDING" : "NA";
      const labelNeed = Boolean(pt?.requiresNutritionLabel || pt?.requiresAllergenCheck);
      const labelCheckStatus = pt?.labelPrintedAt ? "LOGGED" : labelNeed ? "PENDING" : "NA";

      await tx.packingVerificationItem.create({
        data: {
          sessionId: s.id,
          orderItemId: line.id,
          packingTaskId: pt?.id ?? null,
          productId: line.productId ?? undefined,
          title: line.product?.title ?? line.title ?? "Custom item",
          expectedQuantity: line.quantity,
          verifiedQuantity: 0,
          status: "PENDING",
          allergenCheckStatus,
          labelCheckStatus,
        },
      });
    }

    await tx.packingQcEvent.create({
      data: {
        sessionId: s.id,
        orderId: order.id,
        eventType: QC_EVENT.SESSION_STARTED,
        performedById: input.actorUserId,
        metadataJson: { itemCount: order.orderItems.length },
      },
    });

    return s;
  });

  return { sessionId: session.id, reused: false };
}

export type VerificationSessionDetail = {
  session: {
    id: string;
    status: PackingVerificationSessionStatus;
    mode: PackingVerificationSessionMode;
    startedAt: string;
    order: {
      id: string;
      customerName: string;
      status: string;
      fulfillmentType: string;
      notes: string | null;
      brandId: string | null;
    } | null;
  };
  items: {
    id: string;
    title: string;
    expectedQuantity: number;
    verifiedQuantity: number;
    status: PackingVerificationItemStatus;
    allergenCheckStatus: string | null;
    labelCheckStatus: string | null;
    notes: string | null;
    productAllergens: string | null;
  }[];
  timeline: { id: string; eventType: string; createdAt: string; metadata: unknown }[];
};

export async function getVerificationSessionDetail(
  sessionId: string,
  tenantUserId: string,
): Promise<VerificationSessionDetail | null> {
  const s = await prisma.packingVerificationSession.findFirst({
    where: { id: sessionId, userId: tenantUserId },
    include: {
      order: {
        select: {
          id: true,
          customerName: true,
          status: true,
          fulfillmentType: true,
          notes: true,
          brandId: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
        include: { product: { select: { allergens: true } } },
      },
      qcEvents: { orderBy: { createdAt: "desc" }, take: 80 },
    },
  });
  if (!s) return null;

  return {
    session: {
      id: s.id,
      status: s.status,
      mode: s.mode,
      startedAt: s.startedAt.toISOString(),
      order: s.order
        ? {
            id: s.order.id,
            customerName: s.order.customerName,
            status: s.order.status,
            fulfillmentType: s.order.fulfillmentType,
            notes: s.order.notes,
            brandId: s.order.brandId,
          }
        : null,
    },
    items: s.items.map((i) => ({
      id: i.id,
      title: i.title,
      expectedQuantity: i.expectedQuantity,
      verifiedQuantity: i.verifiedQuantity,
      status: i.status,
      allergenCheckStatus: i.allergenCheckStatus,
      labelCheckStatus: i.labelCheckStatus,
      notes: i.notes,
      productAllergens: i.product?.allergens ?? null,
    })),
    timeline: s.qcEvents.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      createdAt: e.createdAt.toISOString(),
      metadata: e.metadataJson,
    })),
  };
}

export async function updateVerificationItem(input: {
  tenantUserId: string;
  actorUserId: string;
  itemId: string;
  patch: {
    verifiedQuantity?: number;
    status?: PackingVerificationItemStatus;
    allergenCheckStatus?: string | null;
    labelCheckStatus?: string | null;
    notes?: string | null;
  };
  qcEventType: string;
  metadata?: object;
}) {
  const item = await prisma.packingVerificationItem.findFirst({
    where: { id: input.itemId, session: { userId: input.tenantUserId } },
    include: { session: true },
  });
  if (!item) throw new Error("ITEM_NOT_FOUND");

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.packingVerificationItem.update({
      where: { id: item.id },
      data: {
        verifiedQuantity: input.patch.verifiedQuantity ?? undefined,
        status: input.patch.status ?? undefined,
        allergenCheckStatus: input.patch.allergenCheckStatus ?? undefined,
        labelCheckStatus: input.patch.labelCheckStatus ?? undefined,
        notes: input.patch.notes ?? undefined,
        verifiedAt:
          input.patch.status === "VERIFIED" || input.patch.status === "SUBSTITUTED" ? now : undefined,
        verifiedById:
          input.patch.status === "VERIFIED" || input.patch.status === "SUBSTITUTED"
            ? input.actorUserId
            : undefined,
      },
    });
    await tx.packingQcEvent.create({
      data: {
        sessionId: item.sessionId,
        orderId: item.session.orderId,
        itemId: item.id,
        eventType: input.qcEventType,
        performedById: input.actorUserId,
        metadataJson: input.metadata ?? undefined,
      },
    });
  });
}

export async function completeVerificationSession(input: {
  tenantUserId: string;
  actorUserId: string;
  sessionId: string;
  outcome: "pass" | "fail" | "partial";
}) {
  const session = await prisma.packingVerificationSession.findFirst({
    where: { id: input.sessionId, userId: input.tenantUserId },
    include: { items: true, order: true },
  });
  if (!session || !session.orderId) throw new Error("SESSION_NOT_FOUND");
  const orderId = session.orderId;

  const items = session.items;
  const bad = items.filter((i) => ["MISSING", "WRONG_ITEM", "DAMAGED", "EXTRA"].includes(i.status));
  const pending = items.filter((i) => i.status === "PENDING");

  let status: PackingVerificationSessionStatus;
  if (input.outcome === "fail") {
    status = "FAILED";
  } else if (input.outcome === "partial") {
    status = "PARTIAL";
  } else {
    if (pending.length > 0 || bad.length > 0) throw new Error("NOT_READY_TO_PASS");
    status = "PASSED";
  }

  await prisma.$transaction(async (tx) => {
    await tx.packingVerificationSession.update({
      where: { id: session.id },
      data: {
        status,
        completedAt: new Date(),
        completedById: input.actorUserId,
      },
    });
    await tx.packingQcEvent.create({
      data: {
        sessionId: session.id,
        orderId,
        eventType: QC_EVENT.SESSION_COMPLETED,
        performedById: input.actorUserId,
        metadataJson: { outcome: input.outcome, status },
      },
    });

    if (status === "PASSED") {
      const o = await tx.order.findFirst({ where: { id: orderId } });
      if (o && (o.status === "CONFIRMED" || o.status === "PREPARING")) {
        await tx.order.update({
          where: { id: o.id },
          data: { status: "READY" },
        });
        await tx.packingQcEvent.create({
          data: {
            sessionId: session.id,
            orderId: o.id,
            eventType: QC_EVENT.ORDER_STATUS_UPDATED,
            performedById: input.actorUserId,
            metadataJson: { to: "READY" },
          },
        });
      }
      await tx.packingTask.updateMany({
        where: { orderId, userId: input.tenantUserId },
        data: { status: "VERIFIED", verifiedAt: new Date() },
      });
      await tx.packingQcEvent.create({
        data: {
          sessionId: session.id,
          orderId,
          eventType: QC_EVENT.PACKING_TASKS_UPDATED,
          performedById: input.actorUserId,
          metadataJson: { to: "VERIFIED" },
        },
      });
    }
  });
}

export async function supervisorOverrideSession(input: {
  tenantUserId: string;
  actorUserId: string;
  sessionId: string;
  reason: string;
}) {
  const session = await prisma.packingVerificationSession.findFirst({
    where: { id: input.sessionId, userId: input.tenantUserId },
  });
  if (!session) throw new Error("SESSION_NOT_FOUND");

  await prisma.$transaction(async (tx) => {
    await tx.packingVerificationOverride.create({
      data: {
        sessionId: session.id,
        reason: input.reason,
        approvedById: input.actorUserId,
      },
    });
    await tx.packingVerificationSession.update({
      where: { id: session.id },
      data: {
        status: "OVERRIDDEN",
        completedAt: new Date(),
        completedById: input.actorUserId,
      },
    });
    await tx.packingQcEvent.create({
      data: {
        sessionId: session.id,
        orderId: session.orderId ?? undefined,
        eventType: QC_EVENT.SUPERVISOR_OVERRIDE,
        performedById: input.actorUserId,
        metadataJson: { reason: input.reason.slice(0, 2000) },
      },
    });
  });
}

export async function sendSessionBackToPacking(input: {
  tenantUserId: string;
  actorUserId: string;
  sessionId: string;
}) {
  const session = await prisma.packingVerificationSession.findFirst({
    where: { id: input.sessionId, userId: input.tenantUserId },
  });
  if (!session?.orderId) throw new Error("SESSION_NOT_FOUND");
  const orderId = session.orderId;

  await prisma.$transaction(async (tx) => {
    await tx.packingTask.updateMany({
      where: { orderId, userId: input.tenantUserId },
      data: {
        status: "QUEUED",
        packedAt: null,
        verifiedAt: null,
      },
    });
    await tx.packingQcEvent.create({
      data: {
        sessionId: session.id,
        orderId,
        eventType: QC_EVENT.SENT_BACK_PACKING,
        performedById: input.actorUserId,
      },
    });
  });
}

export async function searchOrdersByCustomer(input: { tenantUserId: string; query: string }) {
  const q = input.query.trim();
  if (q.length < 2) return [];
  return prisma.order.findMany({
    where: {
      userId: input.tenantUserId,
      customerName: { contains: q, mode: "insensitive" },
      status: { in: ["CONFIRMED", "PREPARING", "READY"] },
    },
    take: 15,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      customerName: true,
      status: true,
      fulfillmentType: true,
      updatedAt: true,
    },
  });
}
