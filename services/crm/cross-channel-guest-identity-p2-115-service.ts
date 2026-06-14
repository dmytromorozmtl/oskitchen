import {
  buildCrossChannelGuestIdentityDemoReport,
  buildCrossChannelGuestIdentityReport,
  buildCrossChannelGuestRow,
  classifyChannelFromSource,
  type CrossChannelGuestIdentityReport,
} from "@/lib/crm/cross-channel-guest-identity-p2-115-operations";
import { CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID } from "@/lib/crm/cross-channel-guest-identity-p2-115-policy";
import { prisma } from "@/lib/prisma";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";

export type CrossChannelGuestIdentitySnapshot = CrossChannelGuestIdentityReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadCrossChannelGuestIdentitySnapshot(
  userId: string,
): Promise<CrossChannelGuestIdentitySnapshot> {
  try {
    const customerScope = await kitchenCustomerListWhereForOwner(userId);
    const customers = await prisma.kitchenCustomer.findMany({
      where: customerScope,
      orderBy: [{ lifetimeValueCents: "desc" }, { lastOrderAt: "desc" }],
      take: 50,
      select: {
        id: true,
        email: true,
        phone: true,
        displayName: true,
        name: true,
        source: true,
        totalOrders: true,
        lifetimeValueCents: true,
        lastOrderAt: true,
      },
    });

    if (customers.length > 0) {
      const guestRows = customers
        .map((customer) => {
          const channel = classifyChannelFromSource(customer.source);
          const lifetimeUsd = customer.lifetimeValueCents / 100;
          const orderCount = Math.max(customer.totalOrders, 1);

          const orders = Array.from({ length: Math.min(orderCount, 5) }, (_, index) => ({
            channel,
            totalUsd: lifetimeUsd / orderCount,
            createdAtIso:
              customer.lastOrderAt?.toISOString() ??
              new Date(Date.now() - index * 86_400_000).toISOString(),
          }));

          return buildCrossChannelGuestRow({
            guestKey: customer.email ?? customer.phone ?? customer.id,
            displayName: customer.displayName ?? customer.name ?? customer.email,
            email: customer.email,
            phone: customer.phone,
            customerId: customer.id,
            orders,
          });
        })
        .filter((row) => row.totalOrders > 0);

      const report = buildCrossChannelGuestIdentityReport({ guests: guestRows });

      return {
        ...report,
        policyId: CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const demo = buildCrossChannelGuestIdentityDemoReport();

  return {
    ...demo,
    policyId: CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
