import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { DataTableShell } from "@/components/tables/data-table-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listTheftDetectionAlerts } from "@/services/costing/costing-alert-service";

export default async function TheftDetectionPage() {
  const { dataUserId } = await getTenantActor();
  const rows = await listTheftDetectionAlerts(dataUserId);

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Theft detection</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cost variance ≥20% — elevated theftScore for investigation (shrink, portion drift, unrecorded waste).
        </p>
        <Link href="/dashboard/costing" className="mt-2 inline-block text-sm text-primary hover:underline">
          ← Costing
        </Link>
      </div>
      <DataTableShell
        skeletonColumns={6}
        skeletonLabels={["Product", "Theft score", "Variance %", "Theoretical", "Actual", "Period"]}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Theft score</TableHead>
              <TableHead className="text-right">Variance %</TableHead>
              <TableHead className="text-right">Theoretical</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead>Period</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.source}-${r.productId}`}>
                <TableCell className="font-medium">{r.productName}</TableCell>
                <TableCell className="text-right tabular-nums text-amber-700 dark:text-amber-400">
                  {r.theftScore}
                </TableCell>
                <TableCell className="text-right tabular-nums">{r.variancePercent}%</TableCell>
                <TableCell className="text-right tabular-nums">{r.theoreticalCost.toFixed(2)}</TableCell>
                <TableCell className="text-right tabular-nums">{r.actualCost.toFixed(2)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.period}</TableCell>
              </TableRow>
            ))}
            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No elevated variance alerts in the last 30 days.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </DataTableShell>
    </PageShell>
  );
}
