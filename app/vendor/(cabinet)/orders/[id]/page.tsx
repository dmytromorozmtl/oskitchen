import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { VendorOrderDetailClient } from "@/components/marketplace/vendor-order-detail-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadVendorOrderDetail } from "@/services/marketplace/vendor-orders-service";
import { loadOrderChatMessages } from "@/services/marketplace/vendor-messaging-service";

export const metadata = { title: "Vendor order detail" };

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const access = await requireVendorCabinetPage({
    operation: "vendor.orders.detail",
    route: `/vendor/orders/${id}`,
  });
  if (!access.ok) return access.deny;

  const order = await loadVendorOrderDetail(access.vendorId, id);
  if (!order) notFound();

  const chatMessages = await loadOrderChatMessages({
    orderId: id,
    perspective: "vendor",
    readerId: access.actor.sessionUserId,
  });

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={order.poNumber ?? "Order detail"}
        description={`${order.buyer.name} · placed ${new Date(order.createdAt).toLocaleDateString()}`}
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/vendor/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to orders
            </Link>
          </Button>
        }
      />

      <VendorOrderDetailClient order={order} canManage={access.canManageOrders} chatMessages={chatMessages} />
    </div>
  );
}
