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
import { MarketplaceOrderVendorChat } from "@/components/marketplace/marketplace-order-vendor-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceOrderDetail } from "@/services/marketplace/marketplace-orders-service";

export function MarketplaceOrderDetailClient({
  order,
  canApprove,
  canCancel,
  canReceive,
}: {
  order: MarketplaceOrderDetail;
  canApprove: boolean;
  canCancel: boolean;
  canReceive: boolean;
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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.sku}</TableCell>
                    <TableCell>{line.productName}</TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    <TableCell>
                      {formatCurrency(line.unitPrice, order.currency as "USD")}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(line.total, order.currency as "USD")}
                    </TableCell>
                    <TableCell>
                      {line.receivedQuantity}/{line.quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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
        <MarketplaceOrderVendorChat orderId={order.id} vendorName={order.vendor.companyName} />
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
