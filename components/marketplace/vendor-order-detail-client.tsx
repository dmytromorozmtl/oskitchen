"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";

import {
  confirmVendorOrderAction,
  shipVendorOrderAction,
  startProcessingVendorOrderAction,
} from "@/actions/vendor/orders";
import { MarketplaceOrderStatusBadge } from "@/components/marketplace/marketplace-order-status-badge";
import { MarketplaceOrderTimeline } from "@/components/marketplace/marketplace-order-timeline";
import { VendorChat } from "@/components/marketplace/vendor-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { VendorOrderDetail } from "@/services/marketplace/vendor-orders-service";
import type { VendorChatMessage } from "@/services/marketplace/vendor-messaging-service";

export function VendorOrderDetailClient({
  order,
  canManage,
  chatMessages = [],
}: {
  order: VendorOrderDetail;
  canManage: boolean;
  chatMessages?: VendorChatMessage[];
}) {
  const [pending, startTransition] = useTransition();
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [shipQty, setShipQty] = useState<Record<string, number>>(
    Object.fromEntries(order.items.map((line) => [line.id, line.quantity])),
  );

  const address = order.deliveryAddress;
  const addressLine = [
    address.line1,
    address.line2,
    [address.city, address.region, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{order.poNumber ?? order.id.slice(0, 8)}</CardTitle>
              <p className="text-sm text-muted-foreground">{order.buyer.name}</p>
            </div>
            <MarketplaceOrderStatusBadge status={order.status} />
          </CardHeader>
          <CardContent className="space-y-4">
            {canManage ? (
              <div className="flex flex-wrap gap-2">
                {["SUBMITTED", "PENDING_APPROVAL"].includes(order.status) ? (
                  <Button
                    className="rounded-full"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await confirmVendorOrderAction(order.id);
                        if (result.ok) toast.success("Order confirmed");
                        else toast.error(result.error);
                      })
                    }
                  >
                    Confirm order
                  </Button>
                ) : null}
                {order.status === "CONFIRMED" ? (
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await startProcessingVendorOrderAction(order.id);
                        if (result.ok) toast.success("Order moved to processing");
                        else toast.error(result.error);
                      })
                    }
                  >
                    Start processing
                  </Button>
                ) : null}
                {["CONFIRMED", "PROCESSING"].includes(order.status) ? (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await shipVendorOrderAction({
                          orderId: order.id,
                          trackingNumber,
                          lines: order.items.map((line) => ({
                            lineItemId: line.id,
                            shippedQuantity: shipQty[line.id] ?? line.quantity,
                          })),
                        });
                        if (result.ok) {
                          toast.success(
                            result.status === "SHIPPED" ? "Order shipped" : "Partial shipment recorded",
                          );
                        } else toast.error(result.error);
                      })
                    }
                  >
                    Mark shipped
                  </Button>
                ) : null}
                <Button asChild variant="outline" className="rounded-full">
                  <a
                    href={`/api/vendor/orders/${order.id}/packing-slip`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Packing slip
                  </a>
                </Button>
              </div>
            ) : null}

            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Payment:</span> {order.paymentMethod}
              </p>
              <p>
                <span className="text-muted-foreground">Requested delivery:</span>{" "}
                {order.requestedDeliveryDate
                  ? new Date(order.requestedDeliveryDate).toLocaleDateString()
                  : "—"}
              </p>
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">Ship to:</span> {addressLine || "—"}
              </p>
              {order.notes ? (
                <p className="sm:col-span-2">
                  <span className="text-muted-foreground">Notes:</span> {order.notes}
                </p>
              ) : null}
            </div>

            {canManage && ["CONFIRMED", "PROCESSING"].includes(order.status) ? (
              <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
                <Label htmlFor="tracking">Tracking number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="Carrier tracking ID"
                  className="max-w-md rounded-full"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust shipped quantities below for partial shipments.
                </p>
              </div>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  {canManage && ["CONFIRMED", "PROCESSING"].includes(order.status) ? (
                    <TableHead>Ship qty</TableHead>
                  ) : null}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.sku}</TableCell>
                    <TableCell>{line.productName}</TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    {canManage && ["CONFIRMED", "PROCESSING"].includes(order.status) ? (
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={line.quantity}
                          value={shipQty[line.id] ?? line.quantity}
                          className="w-20 rounded-full"
                          onChange={(event) =>
                            setShipQty((prev) => ({
                              ...prev,
                              [line.id]: Number(event.target.value),
                            }))
                          }
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="text-right">
                      {formatCurrency(line.total, order.currency as "USD")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end gap-4 text-sm">
              <span>Subtotal {formatCurrency(order.subtotal, order.currency as "USD")}</span>
              <span>Delivery {formatCurrency(order.deliveryFee, order.currency as "USD")}</span>
              <span className="font-medium">
                Total {formatCurrency(order.total, order.currency as "USD")}
              </span>
            </div>
          </CardContent>
        </Card>

        <VendorChat
          orderId={order.id}
          counterpartyName={order.buyer.name}
          perspective="vendor"
          poNumber={order.poNumber}
          initialMessages={chatMessages}
        />
      </div>

      <aside>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketplaceOrderTimeline steps={order.timeline} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
