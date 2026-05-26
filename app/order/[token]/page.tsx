import { format } from "date-fns";
import { notFound } from "next/navigation";

import { OrderQr } from "@/components/public/order-qr";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function PublicOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const order = await prisma.order.findFirst({
    where: { publicLookupToken: token },
    include: {
      orderItems: { include: { product: true } },
    },
  });

  if (!order) notFound();

  const url = `${SITE_URL}/order/${token}`;

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-4">
          <Badge variant="secondary">KitchenOS guest lookup</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Hi {order.customerName},
          </h1>
          <p className="text-muted-foreground">
            Here is the live snapshot for your preorder. Show this screen at the
            counter for faster pickup.
          </p>
          <Card className="space-y-4 border-border/80 bg-card/95 p-6 shadow-lg">
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>
                Status{" "}
                <Badge variant="outline" className="ml-2">
                  {order.status}
                </Badge>
              </span>
              {order.pickupDate && (
                <span>
                  Fulfillment{" "}
                  <strong className="text-foreground">
                    {format(order.pickupDate, "EEEE MMM d")}
                  </strong>
                </span>
              )}
              <span>
                {order.fulfillmentType === "DELIVERY"
                  ? "Delivery route"
                  : "Counter pickup"}
              </span>
            </div>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{item.product?.title ?? item.title ?? "Custom item"}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product?.category ?? "Meal"}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">×{item.quantity}</p>
                    <p className="text-muted-foreground">
                      {formatCurrency(Number(item.product?.price ?? item.unitPrice ?? 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-lg font-semibold">
              Total {formatCurrency(Number(order.total))}
            </p>
          </Card>
        </div>
        <div className="mx-auto flex flex-col items-center gap-3 md:mx-0">
          <OrderQr url={url} />
          <p className="max-w-[220px] text-center text-xs text-muted-foreground">
            Scan for instant lookup — powered by KitchenOS secure tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
