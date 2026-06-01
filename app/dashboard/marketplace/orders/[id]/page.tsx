import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MarketplaceOrderDetailClient } from "@/components/marketplace/marketplace-order-detail-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMarketplaceOrderDetail } from "@/services/marketplace/marketplace-orders-service";
import { loadOrderChatMessages } from "@/services/marketplace/vendor-messaging-service";

export default async function MarketplaceOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) notFound();

  const [access, order] = await Promise.all([
    resolveMarketplaceHubAccess(),
    loadMarketplaceOrderDetail(workspaceId, id),
  ]);

  if (!order) notFound();

  const chatMessages = access.actor.sessionUserId
    ? await loadOrderChatMessages({
        orderId: id,
        perspective: "buyer",
        readerId: access.actor.sessionUserId,
      })
    : [];

  const canCancel = hasPermission(access.actor.granted, "marketplace:orders:cancel");
  const canApprove = access.canCreateOrders;
  const canReceive = access.canCreateOrders;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={order.poNumber ?? "Order detail"}
        description={`${order.vendor.companyName} · placed ${new Date(order.createdAt).toLocaleDateString()}`}
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/marketplace/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to orders
            </Link>
          </Button>
        }
      />

      <MarketplaceOrderDetailClient
        order={order}
        canApprove={canApprove}
        canCancel={canCancel}
        canReceive={canReceive}
        chatMessages={chatMessages}
      />
    </div>
  );
}
