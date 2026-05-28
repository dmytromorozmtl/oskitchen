import React from "react";
import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";

export default async function PosTransactionsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  const rows = await prisma.pOSTransaction.findMany({
    where: { userId: actor.userId },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { order: { select: { id: true, customerName: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">POS transactions</h1>
      <div className="overflow-x-auto rounded-xl border border-border/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {t.createdAt.toISOString().slice(0, 19)}
                </TableCell>
                <TableCell className="font-mono text-xs">{t.receiptNumber}</TableCell>
                <TableCell className="text-xs">{t.paymentMode}</TableCell>
                <TableCell className="text-sm">{t.order?.customerName ?? "—"}</TableCell>
                <TableCell className="text-right font-medium">{String(t.total)}</TableCell>
                <TableCell className="text-right">
                  {t.order ? (
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href={`/dashboard/orders/${t.order.id}`}>Open</Link>
                    </Button>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No POS transactions yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
