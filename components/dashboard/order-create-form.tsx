"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import { createOrder } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";

export type OrderProductOption = {
  id: string;
  title: string;
  menuTitle: string;
  price: string;
};

export function OrderCreateForm({ products }: { products: OrderProductOption[] }) {
  const [fulfillment, setFulfillment] = React.useState<"PICKUP" | "DELIVERY">(
    "PICKUP",
  );
  const [lines, setLines] = React.useState(
    Array.from({ length: 6 }).map(() => ({ productId: "", qty: 1 })),
  );

  const runningTotal = React.useMemo(() => {
    let sum = 0;
    for (const line of lines) {
      if (!line.productId) continue;
      const p = products.find((x) => x.id === line.productId);
      if (!p) continue;
      sum += Number(p.price) * line.qty;
    }
    return sum;
  }, [lines, products]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    fd.set("fulfillmentType", fulfillment);
    lines.forEach((line) => {
      if (line.productId) {
        fd.append("productId", line.productId);
        fd.append("qty", String(line.qty));
      }
    });
    const res = await invokeServerAction(() => createOrder(fd));
    const _err = getActionError(res);
    if (_err) toast.error(_err);
    else {
      toast.success("Order created");
      window.location.href = "/dashboard/orders";
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer name</Label>
            <Input id="customerName" name="customerName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer email</Label>
            <Input id="customerEmail" name="customerEmail" type="email" required />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone (optional)</Label>
            <Input id="customerPhone" name="customerPhone" type="tel" placeholder="+1 …" />
          </div>
          <div className="space-y-2">
            <Label>Fulfillment</Label>
            <Select
              value={fulfillment}
              onValueChange={(v) => setFulfillment(v as "PICKUP" | "DELIVERY")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PICKUP">Pickup</SelectItem>
                <SelectItem value="DELIVERY">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pickupDate">Service / pickup date</Label>
            <Input id="pickupDate" name="pickupDate" type="date" />
          </div>
          <div className="flex flex-col justify-end rounded-xl border border-dashed border-primary/25 bg-primary/5 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Estimated total
            </p>
            <p className="text-2xl font-semibold tracking-tight">
              {formatCurrency(runningTotal)}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} placeholder="Allergies…" />
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Line items</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() =>
              setLines((prev) => [...prev, { productId: "", qty: 1 }])
            }
          >
            Add row
          </Button>
        </div>
        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="grid gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 md:grid-cols-[2fr,120px,auto]"
            >
              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={line.productId}
                  onValueChange={(v) =>
                    setLines((prev) =>
                      prev.map((l, i) => (i === idx ? { ...l, productId: v } : l)),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose meal (active menu)" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} · {p.menuTitle} ({formatCurrency(Number(p.price))})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={line.qty}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === idx ? { ...l, qty: Number(e.target.value) || 1 } : l,
                      ),
                    )
                  }
                />
              </div>
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setLines((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="rounded-full" variant="premium">
        Create preorder
      </Button>
    </form>
  );
}
