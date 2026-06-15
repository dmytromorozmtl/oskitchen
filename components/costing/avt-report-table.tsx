import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { AvtReportPayload } from "@/services/costing/avt-report-service";

export function AvtReportTable({ payload }: { payload: AvtReportPayload }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SKU / menu item usage</CardTitle>
        <CardDescription>{payload.honestyBanner}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 pr-2">Recipe</th>
              <th className="py-2 pr-2">Sold qty</th>
              <th className="py-2 pr-2">Theoretical / unit</th>
              <th className="py-2 pr-2">Est. usage</th>
              <th className="py-2 pr-2">Confidence</th>
              <th className="py-2">Fix</th>
            </tr>
          </thead>
          <tbody>
            {payload.rows.map((r) => (
              <tr key={r.productId} className="border-b border-border/60">
                <td className="py-2 pr-2">
                  <div className="font-medium">{r.title}</div>
                  <p className="text-xs text-muted-foreground">{r.category}</p>
                  {r.missingDataReasons.length > 0 ? (
                    <p className="mt-1 text-xs text-amber-900">{r.missingDataReasons.join(" ")}</p>
                  ) : null}
                  {r.varianceNote ? <p className="mt-1 text-xs text-muted-foreground">{r.varianceNote}</p> : null}
                </td>
                <td className="py-2 pr-2">
                  <Badge variant={r.recipeCoverage ? "secondary" : "outline"} className="rounded-full text-[10px]">
                    {r.recipeCoverage ? "Covered" : "Missing"}
                  </Badge>
                </td>
                <td className="py-2 pr-2 tabular-nums">{r.soldQuantity}</td>
                <td className="py-2 pr-2 tabular-nums">
                  {r.theoreticalIngredientCostPerUnit != null ? formatCurrency(r.theoreticalIngredientCostPerUnit) : "—"}
                </td>
                <td className="py-2 pr-2 tabular-nums">
                  {r.estimatedTheoreticalUsage != null ? formatCurrency(r.estimatedTheoreticalUsage) : "—"}
                </td>
                <td className="py-2 pr-2">
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {r.confidence}
                  </Badge>
                  <p className="mt-1 text-[11px] text-muted-foreground">{r.receivingConfidenceNote}</p>
                </td>
                <td className="py-2">
                  <Link href={r.fixHref} className="text-xs text-primary hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payload.rows.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No rows for current filters.</p> : null}
      </CardContent>
    </Card>
  );
}
