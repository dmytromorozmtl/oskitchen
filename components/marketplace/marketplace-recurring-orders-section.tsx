"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import {
  pauseMarketplaceRecurringOrderAction,
  resumeMarketplaceRecurringOrderAction,
  runMarketplaceRecurringOrderNowAction,
} from "@/actions/marketplace/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MarketplaceRecurringOrderRow } from "@/services/marketplace/recurring-orders-service";

export function MarketplaceRecurringOrdersSection({
  rows,
  canManage,
}: {
  rows: MarketplaceRecurringOrderRow[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success("Recurring order updated");
      else toast.error(result.error ?? "Action failed");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Recurring orders</h2>
          <p className="text-sm text-muted-foreground">
            Scheduled replenishment by vendor · auto-runs via cron when approval is not required.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          {rows.filter((row) => row.isActive).length} active
        </Badge>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No recurring orders yet. Create one from a completed order or vendor catalog.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.vendorName}</TableCell>
                  <TableCell>{row.frequency.toLowerCase()}</TableCell>
                  <TableCell>{new Date(row.nextRunAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={row.isActive ? "default" : "outline"} className="rounded-full">
                      {row.isActive ? "Active" : "Paused"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={pending}
                          onClick={() =>
                            runAction(() =>
                              runMarketplaceRecurringOrderNowAction({
                                recurringOrderId: row.id,
                                deliveryAddress: { source: "manual-recurring-run" },
                              }),
                            )
                          }
                        >
                          Run now
                        </Button>
                        {row.isActive ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                            disabled={pending}
                            onClick={() =>
                              runAction(() => pauseMarketplaceRecurringOrderAction(row.id))
                            }
                          >
                            Pause
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                            disabled={pending}
                            onClick={() =>
                              runAction(() => resumeMarketplaceRecurringOrderAction(row.id))
                            }
                          >
                            Resume
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
