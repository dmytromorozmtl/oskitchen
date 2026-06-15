import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CostingAlertsSummary } from "@/services/costing/costing-alert-service";

export function CostingVarianceCard({ summary }: { summary: CostingAlertsSummary }) {
  if (!summary.hasAlerts) return null;

  return (
    <Card className="border-amber-300/60 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-amber-900 dark:text-amber-100">
          Cost variance ({summary.count})
        </CardTitle>
        <CardDescription>Actual vs theoretical — review before margin drifts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ul className="space-y-1 text-amber-900 dark:text-amber-100">
          {summary.topAlerts.map((a) => (
            <li key={`${a.source}-${a.productId}`}>
              <span className="font-medium">{a.productName}</span> — {a.variancePercent}% (
              ${a.theoreticalCost.toFixed(2)} → ${a.actualCost.toFixed(2)})
            </li>
          ))}
        </ul>
        <Link href="/dashboard/costing/avt" className="font-medium text-primary underline underline-offset-4">
          Open A vs T report
        </Link>
      </CardContent>
    </Card>
  );
}
