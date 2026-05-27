import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProductMappingPageAccess } from "@/lib/product-mapping/mapping-page-access";
import { getCachedIntegrationConnectionListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import { productMappingListWhereForOwner } from "@/lib/scope/workspace-product-mapping-scope";
import { prisma } from "@/lib/prisma";

export default async function SyncHealthPage() {
  const access = await requireProductMappingPageAccess("mapping.view");
  if (!access.ok) return access.deny;
  const dataUserId = access.userId;
  const [connectionWhere, mappingWhere] = await Promise.all([
    getCachedIntegrationConnectionListWhere(),
    productMappingListWhereForOwner(dataUserId),
  ]);
  const [connections, providerCounts] = await Promise.all([
    prisma.integrationConnection.findMany({
      where: connectionWhere,
      select: {
        id: true,
        name: true,
        provider: true,
        status: true,
        shopDomain: true,
        lastSyncAt: true,
        lastError: true,
      },
      orderBy: { lastSyncAt: "desc" },
    }),
    prisma.productMapping.groupBy({
      by: ["providerKey", "status"],
      where: mappingWhere,
      _count: { _all: true },
    }),
  ]);

  const totals = new Map<string, { unmapped: number; suggested: number; approved: number; conflict: number; archived: number }>();
  for (const row of providerCounts) {
    const key = row.providerKey ?? "CUSTOM";
    const current = totals.get(key) ?? { unmapped: 0, suggested: 0, approved: 0, conflict: 0, archived: 0 };
    if (row.status === "UNMAPPED" || row.status === "NEEDS_REVIEW") current.unmapped += row._count._all;
    else if (row.status === "SUGGESTED") current.suggested += row._count._all;
    else if (row.status === "APPROVED" || row.status === "CONFIRMED") current.approved += row._count._all;
    else if (row.status === "CONFLICT") current.conflict += row._count._all;
    else if (row.status === "ARCHIVED") current.archived += row._count._all;
    totals.set(key, current);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sync health</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Per-provider snapshot of mapping coverage and last catalog sync. Catalog syncs are managed by
          Sales Channels — this view is read-only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per-provider mapping coverage</CardTitle>
          <CardDescription>Based on current ProductMapping rows.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground">
                <th className="px-3 py-2 font-medium">Provider</th>
                <th className="px-3 py-2 font-medium">Unmapped / review</th>
                <th className="px-3 py-2 font-medium">Suggested</th>
                <th className="px-3 py-2 font-medium">Approved</th>
                <th className="px-3 py-2 font-medium">Conflicts</th>
                <th className="px-3 py-2 font-medium">Archived</th>
              </tr>
            </thead>
            <tbody>
              {totals.size === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-muted-foreground">
                    No data yet.
                  </td>
                </tr>
              ) : (
                [...totals.entries()].map(([provider, counts]) => (
                  <tr key={provider} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{provider}</td>
                    <td className="px-3 py-2 tabular-nums">{counts.unmapped}</td>
                    <td className="px-3 py-2 tabular-nums">{counts.suggested}</td>
                    <td className="px-3 py-2 tabular-nums">{counts.approved}</td>
                    <td className="px-3 py-2 tabular-nums">{counts.conflict}</td>
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{counts.archived}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connections</CardTitle>
          <CardDescription>
            Catalog sync is set up in {" "}
            <Link href="/dashboard/sales-channels" className="underline">Sales Channels</Link>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No external connections yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {connections.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.provider} · {c.shopDomain ?? "no domain"} · status {c.status}
                    </p>
                    {c.lastError ? <p className="text-xs text-destructive">Last error: {c.lastError}</p> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.lastSyncAt ? `Last sync ${c.lastSyncAt.toISOString().slice(0, 16).replace("T", " ")}` : "Never synced"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
