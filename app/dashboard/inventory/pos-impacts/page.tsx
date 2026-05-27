import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getPosInventoryImpactDiagnostics } from "@/services/inventory/pos-inventory-impact-query-service";

function statusBadgeVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "APPLIED") return "default";
  if (status === "PENDING_CONFIGURATION") return "secondary";
  return "outline";
}

export default async function PosInventoryImpactsPage() {
  const { dataUserId } = await getTenantActor();
  const { summary, events } = await getPosInventoryImpactDiagnostics(dataUserId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">POS inventory impacts</h1>
          <p className="text-sm text-muted-foreground">
            Last 30 days of POS sale signals — recipe-linked lines deplete stock when configured.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/dashboard/inventory/counts" className="text-primary hover:underline">
            Physical counts →
          </Link>
          <Link href="/dashboard/inventory/waste" className="text-primary hover:underline">
            Waste log →
          </Link>
        </div>
      </div>

      <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
        <span className="font-medium">Beta.</span> Pending rows mean no active recipe (or ingredients could not be
        updated). Applied rows consumed ingredient stock from the linked recipe.
      </p>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total (30d)</CardDescription>
            <CardTitle className="text-2xl">{summary.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applied</CardDescription>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">{summary.applied}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending recipe</CardDescription>
            <CardTitle className="text-2xl">{summary.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Other status</CardDescription>
            <CardTitle className="text-2xl">{summary.other}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent impact events</CardTitle>
          <CardDescription>Newest POS checkout lines with a product reference.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Order</th>
                <th className="py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    No POS inventory impacts in the last 30 days.
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-4 whitespace-nowrap">{e.createdAt.toLocaleString()}</td>
                    <td className="py-2 pr-4">{e.productName}</td>
                    <td className="py-2 pr-4 tabular-nums">{e.quantity}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusBadgeVariant(e.status)}>{e.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="py-2 pr-4">
                      {e.orderId ? (
                        <Link href={`/dashboard/orders/${e.orderId}`} className="text-primary hover:underline">
                          Open
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 max-w-xs text-muted-foreground">{e.note ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
