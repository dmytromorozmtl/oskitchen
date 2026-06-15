"use server";

import { revalidatePath } from "next/cache";

import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import {
  bulkConfirmVendorOrders,
  confirmVendorOrder,
  shipVendorOrder,
  startProcessingVendorOrder,
  type ShipLineInput,
} from "@/services/marketplace/vendor-orders-service";

async function requireVendorOrdersWrite() {
  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false as const, error: "Access denied." };
  if (!access.canManageOrders) {
    return { ok: false as const, error: "You do not have permission to manage vendor orders." };
  }
  return { ok: true as const, access };
}

function revalidateVendorOrders(orderId?: string) {
  revalidatePath("/vendor/orders");
  revalidatePath("/vendor/dashboard");
  if (orderId) revalidatePath(`/vendor/orders/${orderId}`);
}

export async function bulkConfirmVendorOrdersAction(orderIds: string[]) {
  const gate = await requireVendorOrdersWrite();
  if (!gate.ok) return gate;

  const result = await bulkConfirmVendorOrders({
    vendorId: gate.access.vendorId,
    orderIds,
  });

  if (result.ok) revalidateVendorOrders();
  return result;
}

export async function confirmVendorOrderAction(orderId: string) {
  const gate = await requireVendorOrdersWrite();
  if (!gate.ok) return gate;

  const result = await confirmVendorOrder({
    vendorId: gate.access.vendorId,
    orderId,
  });

  if (result.ok) revalidateVendorOrders(orderId);
  return result;
}

export async function startProcessingVendorOrderAction(orderId: string) {
  const gate = await requireVendorOrdersWrite();
  if (!gate.ok) return gate;

  const result = await startProcessingVendorOrder({
    vendorId: gate.access.vendorId,
    orderId,
  });

  if (result.ok) revalidateVendorOrders(orderId);
  return result;
}

export async function shipVendorOrderAction(input: {
  orderId: string;
  trackingNumber: string;
  confirmedDeliveryDate?: string;
  lines?: ShipLineInput[];
}) {
  const gate = await requireVendorOrdersWrite();
  if (!gate.ok) return gate;

  const result = await shipVendorOrder({
    vendorId: gate.access.vendorId,
    ...input,
  });

  if (result.ok) revalidateVendorOrders(input.orderId);
  return result;
}
