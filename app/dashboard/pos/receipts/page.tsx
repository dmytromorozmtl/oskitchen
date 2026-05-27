import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";

export default async function PosReceiptsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return (
      <PosAccessCard
        title="POS receipts"
        description="You do not have permission to view POS receipts."
        primaryHref="/dashboard/pos"
        primaryLabel="Back to POS"
      />
    );
  }

  const rows = await prisma.pOSReceipt.findMany({
    where: { transaction: { userId: actor.userId } },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { transaction: { select: { receiptNumber: true, orderId: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">POS receipts</h1>
      <p className="text-sm text-muted-foreground">
        Plain-text receipts are generated on checkout. Use your browser print dialog for paper copies.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt #</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.receiptNumber}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {r.createdAt.toISOString().slice(0, 19)}
                </TableCell>
                <TableCell className="max-w-md truncate text-xs text-muted-foreground">
                  {r.receiptText.slice(0, 120)}…
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  No receipts yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
