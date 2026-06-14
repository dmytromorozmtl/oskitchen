import { prisma } from "@/lib/prisma";
import {
  recomputeMetricsForOrderEmail,
} from "@/services/crm/customer-metrics-service";

/**
 * Best-effort CRM refresh after a POS sale when we can resolve an email for the customer.
 * `createOrderViaCenter` already upserts when `customerEmail` exists; this catches `customerId`-only profiles.
 */
export async function syncPosOrderToCrm(userId: string, orderId: string): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { customerId: true, customerEmail: true },
  });
  if (!order) return;
  let email: string | null = order.customerEmail;
  if (!email && order.customerId) {
    const cust = await prisma.kitchenCustomer.findFirst({
      where: { id: order.customerId, userId },
      select: { email: true },
    });
    email = cust?.email ?? null;
  }
  if (!email || email.endsWith("@local.kitchenos.invalid")) return;
  await recomputeMetricsForOrderEmail(userId, email).catch(() => undefined);
}
