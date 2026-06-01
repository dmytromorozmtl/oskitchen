"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { receiveMarketplaceOrderAction } from "@/actions/marketplace/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MarketplaceOrderDetail } from "@/services/marketplace/marketplace-orders-service";

export function MarketplaceOrderReceivingForm({
  order,
  canReceive,
}: {
  order: MarketplaceOrderDetail;
  canReceive: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(order.items.map((line) => [line.id, line.receivedQuantity])),
  );

  if (!canReceive) return null;
  if (!["SHIPPED", "DELIVERED", "PROCESSING", "CONFIRMED"].includes(order.status)) {
    return null;
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-border/80 bg-card/80 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await receiveMarketplaceOrderAction({
            orderId: order.id,
            lines: order.items.map((line) => ({
              lineItemId: line.id,
              receivedQuantity: quantities[line.id] ?? 0,
            })),
          });
          if (result.ok) {
            toast.success(`Receiving saved · status ${result.status}`);
          } else {
            toast.error(result.error);
          }
        });
      }}
    >
      <div>
        <h3 className="text-sm font-semibold">Receiving</h3>
        <p className="text-xs text-muted-foreground">
          Record quantities received against each line item.
        </p>
      </div>

      <div className="space-y-3">
        {order.items.map((line) => (
          <div key={line.id} className="grid gap-2 sm:grid-cols-[1fr_8rem] sm:items-end">
            <div>
              <p className="text-sm font-medium">{line.productName}</p>
              <p className="text-xs text-muted-foreground">
                {line.sku} · ordered {line.quantity}
              </p>
            </div>
            <div>
              <Label htmlFor={`recv-${line.id}`} className="text-xs">
                Received
              </Label>
              <Input
                id={`recv-${line.id}`}
                type="number"
                min={0}
                max={line.quantity}
                value={quantities[line.id] ?? 0}
                onChange={(event) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [line.id]: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={pending} className="rounded-full">
        {pending ? "Saving…" : "Save receiving"}
      </Button>
    </form>
  );
}
