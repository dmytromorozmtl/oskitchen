import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canExportReports } from "@/lib/reports/report-export-access";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { calculateRoyalties } from "@/services/franchise/franchise-service";

export default async function FranchiseRoyaltiesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: p } = await searchParams;
  const period = p === "quarter" ? "quarter" : "month";
  const actor = await requireWorkspacePermissionActor();
  const data = await calculateRoyalties(actor.dataUserId, period);
  const canExport = canExportReports(actor);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Franchise royalties</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/enterprise/franchise"
            className="rounded-full border px-3 py-1 text-sm"
            data-testid="franchise-enterprise-link"
          >
            Franchise suite
          </Link>
          <Link
            href="?period=month"
            className={`rounded-full border px-3 py-1 text-sm ${period === "month" ? "bg-primary text-primary-foreground" : ""}`}
          >
            Month
          </Link>
          <Link
            href="?period=quarter"
            className={`rounded-full border px-3 py-1 text-sm ${period === "quarter" ? "bg-primary text-primary-foreground" : ""}`}
          >
            Quarter
          </Link>
          {canExport && (
            <a
              href={`/api/export/franchise-royalties?period=${period}`}
              className="rounded-full border px-3 py-1 text-sm"
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total royalties</CardTitle>
          <p className="text-2xl font-semibold">${data.totalRoyalties.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Since {data.since}</p>
        </CardHeader>
        <CardContent>
          {data.franchises.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active franchises configured.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Franchise</th>
                  <th className="pb-2 text-right">Revenue</th>
                  <th className="pb-2 text-right">Rate</th>
                  <th className="pb-2 text-right">Royalty</th>
                </tr>
              </thead>
              <tbody>
                {data.franchises.map((f) => (
                  <tr key={f.franchiseId} className="border-b">
                    <td className="py-2">{f.franchiseName}</td>
                    <td className="py-2 text-right">${f.totalRevenue.toFixed(2)}</td>
                    <td className="py-2 text-right">{f.royaltyRate}%</td>
                    <td className="py-2 text-right font-medium">${f.royaltyAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
