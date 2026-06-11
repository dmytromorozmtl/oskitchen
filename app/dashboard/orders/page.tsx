import { OrdersTable } from "@/components/dashboard/orders-table";
import {
  DASHBOARD_ORDER_LIST_TAKE,
  ORDER_LIST_PROFILE_LABEL,
} from "@/lib/orders/order-list-constants";
import { profileQuery } from "@/lib/observability/prisma-query-profile";
import { getTenantDataUserId } from "@/lib/scope/cached-tenant";
import { getCachedOrderListWhere } from "@/lib/scope/cached-workspace-order-scope";
import { orderListSelect } from "@/lib/scope/user-owned-guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const dataUserId = await getTenantDataUserId();
  const orderWhere = await getCachedOrderListWhere();

  const [orders, settings] = await Promise.all([
    profileQuery(ORDER_LIST_PROFILE_LABEL, () =>
      prisma.order.findMany({
        where: orderWhere,
        orderBy: { createdAt: "desc" },
        take: DASHBOARD_ORDER_LIST_TAKE,
        select: orderListSelect,
      }),
    ),
    prisma.kitchenSettings.findUnique({
      where: { userId: dataUserId },
      select: { locale: true },
    }),
  ]);

  return (
    <OrdersTable
      locale={settings?.locale ?? "en"}
      orders={orders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        total: String(o.total),
        status: o.status,
        fulfillmentType: o.fulfillmentType,
        pickupDate: o.pickupDate ? o.pickupDate.toISOString() : null,
        createdAt: o.createdAt.toISOString(),
        lookupToken: o.publicLookupToken,
      }))}
    />
  );
}
