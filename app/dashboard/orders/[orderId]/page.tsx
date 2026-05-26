import { notFound } from "next/navigation";

import { OrderDetailHeader } from "@/components/orders/order-detail-header";
import { OrderDetailPanels } from "@/components/orders/order-detail-panels";
import { OrderDetailTabNav } from "@/components/orders/order-detail-tab-nav";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { loadOrderDetailPageData } from "@/services/orders/order-detail-service";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { orderId } = await params;
  const sp = (await searchParams) ?? {};
  const tab = typeof sp.tab === "string" ? sp.tab : "overview";
  const { dataUserId } = await requireTenantActor();

  const data = await loadOrderDetailPageData(dataUserId, orderId);
  if (!data) notFound();
  const { order, lifecycleView, phase } = data;

  return (
    <div className="space-y-6">
      <OrderDetailHeader
        order={order}
        lifecycleView={lifecycleView}
        phase={phase}
        total={Number(order.total)}
        publicLookupToken={order.publicLookupToken}
        nextActions={data.nextActions}
      />
      <OrderDetailTabNav
        orderId={order.id}
        tab={tab}
        counts={{
          items: order.orderItems.length,
          production: order.productionWorkItems.length,
          packing: order.packingTasks.length,
          activity: data.activity.length,
        }}
      />
      <OrderDetailPanels tab={tab} data={data} />
    </div>
  );
}
