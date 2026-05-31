"use client";

import { format, parseISO } from "date-fns";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PackingOrderDTO } from "@/lib/packing/packing-order-dto";

export type { PackingOrderDTO };

function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
}

/** Original PDF + CSV export UI — logic unchanged for compatibility. */
export function PackingExportsPanel({ orders }: { orders: PackingOrderDTO[] }) {
  function downloadCsv(filename: string, rows: string[][]) {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf(
    title: string,
    head: string[],
    body: (string | number)[][],
  ) {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text(title, 40, 48);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("OS Kitchen packing sheet", 40, 66);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 84,
      head: [head],
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 106, 184] },
    });
    doc.save(`${title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  }

  if (!orders.length) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/10 p-6 text-center shadow-none sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">No orders in this pipeline slice</p>
            <p className="mt-1 text-sm text-muted-foreground">
              PDF and CSV exports use live orders in Confirmed / Preparing / Ready. Generate a packing queue to track
              line-level tasks, then export from the same underlying orders.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const byPrepared = new Map<string, PackingOrderDTO[]>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.preparedDate
        ? format(parseISO(item.preparedDate), "yyyy-MM-dd")
        : "unscheduled";
      if (!byPrepared.has(key)) byPrepared.set(key, []);
      const bucket = byPrepared.get(key)!;
      if (!bucket.find((o) => o.id === order.id)) bucket.push(order);
    });
  });

  return (
    <Tabs defaultValue="customer">
      <TabsList className="flex flex-wrap gap-2">
        <TabsTrigger value="customer" className="rounded-full">
          By customer
        </TabsTrigger>
        <TabsTrigger value="prepared" className="rounded-full">
          By prepared date
        </TabsTrigger>
        <TabsTrigger value="fulfillment" className="rounded-full">
          Delivery vs pickup
        </TabsTrigger>
      </TabsList>

      <TabsContent value="customer" className="space-y-4 pt-4">
        <Card className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    void exportPdf(
                      `packing-${order.customerName}`,
                      ["Item", "Qty", "Prepared", "Pickup"],
                      order.items.map((i) => [
                        i.title,
                        i.quantity,
                        i.preparedDate ? format(parseISO(i.preparedDate), "MMM d") : "—",
                        i.pickupDate ? format(parseISO(i.pickupDate), "MMM d") : "—",
                      ]),
                    )
                  }
                >
                  PDF
                </Button>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {order.items.map((i) => (
                  <li key={`${order.id}-${i.orderItemId}`}>
                    {i.quantity}× {i.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Button
            type="button"
            variant="premium"
            className="rounded-full"
            onClick={() =>
              downloadCsv(
                "packing-by-customer.csv",
                [
                  ["Customer", "Email", "Item", "Qty", "Prepared", "Pickup"],
                  ...orders.flatMap((o) =>
                    o.items.map((i) => [
                      o.customerName,
                      o.customerEmail,
                      i.title,
                      String(i.quantity),
                      i.preparedDate ? format(parseISO(i.preparedDate), "yyyy-MM-dd") : "",
                      i.pickupDate ? format(parseISO(i.pickupDate), "yyyy-MM-dd") : "",
                    ]),
                  ),
                ],
              )
            }
          >
            Download CSV (all)
          </Button>
        </Card>
      </TabsContent>

      <TabsContent value="prepared" className="space-y-4 pt-4">
        <Card className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
          {Array.from(byPrepared.entries()).map(([dateKey, bucket]) => (
            <div key={dateKey} className="rounded-xl border border-border/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold">
                  Prepared {dateKey === "unscheduled" ? "unscheduled" : dateKey}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    void exportPdf(
                      `prepared-${dateKey}`,
                      ["Customer", "Item", "Qty"],
                      bucket.flatMap((o) =>
                        o.items
                          .filter((i) =>
                            dateKey === "unscheduled"
                              ? !i.preparedDate
                              : i.preparedDate &&
                                format(parseISO(i.preparedDate), "yyyy-MM-dd") === dateKey,
                          )
                          .map((i) => [o.customerName, i.title, i.quantity]),
                      ),
                    )
                  }
                >
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </TabsContent>

      <TabsContent value="fulfillment" className="space-y-4 pt-4">
        <Card className="grid gap-4 border-border/80 bg-card/90 p-6 shadow-sm md:grid-cols-2">
          <div className="rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Delivery</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  void exportPdf(
                    "delivery-run",
                    ["Customer", "Item", "Qty", "Total"],
                    orders
                      .filter((o) => o.fulfillmentType === "DELIVERY")
                      .flatMap((o) =>
                        o.items.map((i) => [o.customerName, i.title, i.quantity, ""]),
                      ),
                  )
                }
              >
                PDF
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {orders.filter((o) => o.fulfillmentType === "DELIVERY").length} orders
            </p>
          </div>
          <div className="rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Pickup</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  void exportPdf(
                    "pickup-counter",
                    ["Customer", "Item", "Qty"],
                    orders
                      .filter((o) => o.fulfillmentType === "PICKUP")
                      .flatMap((o) => o.items.map((i) => [o.customerName, i.title, i.quantity])),
                  )
                }
              >
                PDF
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {orders.filter((o) => o.fulfillmentType === "PICKUP").length} orders
            </p>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
