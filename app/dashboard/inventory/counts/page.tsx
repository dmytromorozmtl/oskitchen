import Link from "next/link";

import { startInventoryCountAction } from "@/actions/inventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listInventoryCounts } from "@/services/inventory/count-service";

export default async function InventoryCountsPage() {
  const { dataUserId } = await getTenantActor();
  const counts = await listInventoryCounts(dataUserId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Physical inventory counts</h1>
          <p className="text-sm text-muted-foreground">Cycle counts with variance vs on-hand stock.</p>
        </div>
        <Link href="/dashboard/inventory/waste" className="text-sm text-primary hover:underline">
          Waste log →
        </Link>
      </div>

      <form action={startInventoryCountAction}>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Start new count
        </button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Count history</CardTitle>
          <CardDescription>Open a count to enter quantities and complete.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Items</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {counts.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="py-2 pr-4">{c.createdAt.toLocaleString()}</td>
                  <td className="py-2 pr-4">{c.status}</td>
                  <td className="py-2 pr-4">{c._count.items}</td>
                  <td className="py-2">
                    <Link
                      href={`/dashboard/inventory/counts/${c.id}`}
                      className="text-primary hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
