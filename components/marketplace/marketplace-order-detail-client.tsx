"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Download, ExternalLink } from "lucide-react";

import {
  approveMarketplaceOrderAction,
  cancelMarketplaceOrderAction,
} from "@/actions/marketplace/orders";
import { MarketplaceOrderReceivingForm } from "@/components/marketplace/marketplace-order-receiving-form";
import { MarketplaceOrderStatusBadge } from "@/components/marketplace/marketplace-order-status-badge";
import { MarketplaceOrderTimeline } from "@/components/marketplace/marketplace-order-timeline";
import { MarketplaceResponsiveDataList } from "@/components/marketplace/marketplace-responsive-data-list";
import { VendorChat } from "@/components/marketplace/vendor-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceOrderDetail } from "@/services/marketplace/marketplace-orders-service";
import type { VendorChatMessage } from "@/services/marketplace/vendor-messaging-service";

export function MarketplaceOrderDetailClient({
  order,
  canApprove,
  canCancel,
  canReceive,
  chatMessages = [],
}: {
  order: MarketplaceOrderDetail;
  canApprove: boolean;
  canCancel: boolean;
  canReceive: boolean;
  chatMessages?: VendorChatMessage[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{order.poNumber ?? order.id.slice(0, 8)}</CardTitle>
              <p className="text-sm text-muted-foreground">{order.vendor.companyName}</p>
            </div>
            <MarketplaceOrderStatusBadge status={order.status} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {order.status === "PENDING_APPROVAL" && canApprove ? (
                <Button
                  className="rounded-full"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await approveMarketplaceOrderAction(order.id);
                      if (result.ok) toast.success("Order approved");
                      else toast.error(result.error);
                    })
                  }
                >
                  Approve order
                </Button>
              ) : null}
              {canCancel &&
              !["COMPLETED", "CANCELLED", "SHIPPED", "DELIVERED"].includes(order.status) ? (
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await cancelMarketplaceOrderAction(order.id);
                      if (result.ok) toast.success("Order cancelled");
                      else toast.error(result.error);
                    })
                  }
                >
                  Cancel order
                </Button>
              ) : null}
              <Button asChild variant="outline" className="rounded-full">
                <a
                  href={`/api/marketplace/orders/${order.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Invoice PDF
                </a>
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <Link href={`/dashboard/marketplace/vendors/${order.vendor.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Vendor profile
                </Link>
              </Button>
            </div>

            <MarketplaceResponsiveDataList
              rows={order.items}
              emptyMessage="No line items on this order."
              columns={[
                { key: "sku", header: "SKU", cell: (line) => line.sku },
                { key: "product", header: "Product", cell: (line) => line.productName },
                { key: "qty", header: "Qty", cell: (line) => line.quantity },
                {
                  key: "unit",
                  header: "Unit",
                  cell: (line) => formatCurrency(line.unitPrice, order.currency as "USD"),
                },
                {
                  key: "total",
                  header: "Total",
                  cell: (line) => formatCurrency(line.total, order.currency as "USD"),
                },
                {
                  key: "received",
                  header: "Received",
                  cell: (line) => `${line.receivedQuantity}/${line.quantity}`,
                },
              ]}
              renderMobileCard={(line) => (
                <div className="space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{line.productName}</p>
                      <p className="text-xs text-muted-foreground">SKU {line.sku}</p>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(line.total, order.currency as "USD")}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 text-muted-foreground">
                    <span>Qty {line.quantity}</span>
                    <span>Unit {formatCurrency(line.unitPrice, order.currency as "USD")}</span>
                    <span>
                      Received {line.receivedQuantity}/{line.quantity}
                    </span>
                  </div>
                </div>
              )}
            />

            <div className="flex flex-col gap-1 text-sm">
              <p>
                <span className="text-muted-foreground">Subtotal:</span>{" "}
                {formatCurrency(order.subtotal, order.currency as "USD")}
              </p>
              <p>
                <span className="text-muted-foreground">Delivery:</span>{" "}
                {formatCurrency(order.deliveryFee, order.currency as "USD")}
              </p>
              <p className="font-semibold">
                Total: {formatCurrency(order.total, order.currency as "USD")}
              </p>
            </div>
          </CardContent>
        </Card>

        <MarketplaceOrderReceivingForm order={order} canReceive={canReceive} />
        <VendorChat
          orderId={order.id}
          counterpartyName={order.vendor.companyName}
          perspective="buyer"
          poNumber={order.poNumber}
          initialMessages={chatMessages}
        />
      </div>

      <Card className="h-fit border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Status timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <MarketplaceOrderTimeline steps={order.timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
