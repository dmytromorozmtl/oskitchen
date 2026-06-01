"use server";

import { revalidatePath } from "next/cache";

import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  approveMarketplaceOrder,
  cancelMarketplaceOrder,
  receiveMarketplaceOrder,
} from "@/services/marketplace/marketplace-orders-service";
import {
  createMarketplaceRecurringOrder,
  runMarketplaceRecurringOrder,
  setMarketplaceRecurringOrderActive,
  updateMarketplaceRecurringOrder,
  type RecurringOrderItem,
} from "@/services/marketplace/recurring-orders-service";
import type { MarketplaceRecurringFrequency } from "@prisma/client";

async function requireOrdersRead() {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) return { ok: false as const, error: "Workspace required." };
  if (!hasPermission(actor.granted, "marketplace:orders:read")) {
    return { ok: false as const, error: "You do not have permission to view marketplace orders." };
  }
  return { ok: true as const, actor };
}

export async function approveMarketplaceOrderAction(orderId: string) {
  const access = await requireOrdersRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:orders:create")) {
    return { ok: false as const, error: "You do not have permission to approve orders." };
  }

  const result = await approveMarketplaceOrder({
    workspaceId: access.actor.workspaceId!,
    orderId,
    approvedById: access.actor.dataUserId,
  });

  if (result.ok) {
    revalidatePath("/dashboard/marketplace/orders");
    revalidatePath(`/dashboard/marketplace/orders/${orderId}`);
    revalidatePath("/dashboard/marketplace");
  }

  return result;
}

export async function cancelMarketplaceOrderAction(orderId: string) {
  const access = await requireOrdersRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:orders:cancel")) {
    return { ok: false as const, error: "You do not have permission to cancel orders." };
  }

  const result = await cancelMarketplaceOrder({
    workspaceId: access.actor.workspaceId!,
    orderId,
  });

  if (result.ok) {
    revalidatePath("/dashboard/marketplace/orders");
    revalidatePath(`/dashboard/marketplace/orders/${orderId}`);
  }

  return result;
}

export async function receiveMarketplaceOrderAction(input: {
  orderId: string;
  lines: Array<{ lineItemId: string; receivedQuantity: number }>;
}) {
  const access = await requireOrdersRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:orders:create")) {
    return { ok: false as const, error: "You do not have permission to receive orders." };
  }

  try {
    const result = await receiveMarketplaceOrder({
      workspaceId: access.actor.workspaceId!,
      orderId: input.orderId,
      lines: input.lines,
    });

    if (result.ok) {
      revalidatePath("/dashboard/marketplace/orders");
      revalidatePath(`/dashboard/marketplace/orders/${input.orderId}`);
    }

    return result;
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Receiving failed.",
    };
  }
}

export async function createMarketplaceRecurringOrderAction(input: {
  vendorId: string;
  name: string;
  items: RecurringOrderItem[];
  frequency: MarketplaceRecurringFrequency;
  approvalRequired?: boolean;
}) {
  const access = await requireOrdersRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:recurring:manage")) {
    return { ok: false as const, error: "You do not have permission to manage recurring orders." };
  }

  const result = await createMarketplaceRecurringOrder({
    workspaceId: access.actor.workspaceId!,
    ...input,
  });

  if (result.ok) {
    revalidatePath("/dashboard/marketplace/orders");
  }

  return result;
}

export async function updateMarketplaceRecurringOrderAction(input: {
  recurringOrderId: string;
  name?: string;
  items?: RecurringOrderItem[];
  frequency?: MarketplaceRecurringFrequency;
  approvalRequired?: boolean;
}) {
  const access = await requireOrdersRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:recurring:manage")) {
    return { ok: false as const, error: "You do not have permission to manage recurring orders." };
  }

  const result = await updateMarketplaceRecurringOrder({
    workspaceId: access.actor.workspaceId!,
    ...input,
  });

  if (result.ok) {
    revalidatePath("/dashboard/marketplace/orders");
  }

  return result;
}

export async function pauseMarketplaceRecurringOrderAction(recurringOrderId: string) {
  const access = await requireOrdersRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:recurring:manage")) {
    return { ok: false as const, error: "You do not have permission to manage recurring orders." };
  }

  const result = await setMarketplaceRecurringOrderActive({
    workspaceId: access.actor.workspaceId!,
    recurringOrderId,
    isActive: false,
  });

  if (result.ok) revalidatePath("/dashboard/marketplace/orders");
  return result;
}

export async function resumeMarketplaceRecurringOrderAction(recurringOrderId: string) {
  const access = await requireOrdersRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:recurring:manage")) {
    return { ok: false as const, error: "You do not have permission to manage recurring orders." };
  }

  const result = await setMarketplaceRecurringOrderActive({
    workspaceId: access.actor.workspaceId!,
    recurringOrderId,
    isActive: true,
  });

  if (result.ok) revalidatePath("/dashboard/marketplace/orders");
  return result;
}

export async function runMarketplaceRecurringOrderNowAction(input: {
  recurringOrderId: string;
  deliveryAddress: Record<string, unknown>;
}) {
  const access = await requireOrdersRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:recurring:manage")) {
    return { ok: false as const, error: "You do not have permission to run recurring orders." };
  }

  try {
    const result = await runMarketplaceRecurringOrder({
      recurringOrderId: input.recurringOrderId,
      actorUserId: access.actor.sessionUserId,
      actorEmail: access.actor.email,
      actorRole: access.actor.staffRoleType ?? access.actor.workspaceRole,
      deliveryAddress: input.deliveryAddress,
    });

    if (result.ok) {
      revalidatePath("/dashboard/marketplace/orders");
      revalidatePath("/dashboard/marketplace");
    }

    return result;
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Recurring run failed.",
    };
  }
}
