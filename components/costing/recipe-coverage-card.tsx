import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AvtReportPayload } from "@/services/costing/avt-report-service";

export function RecipeCoverageCard({ payload }: { payload: AvtReportPayload }) {
  const covered = payload.rows.filter((r) => r.recipeCoverage).length;
  const total = payload.rows.length;
  const pct = total ? Math.round((covered / total) * 100) : 0;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recipe coverage (this window)</CardTitle>
        <CardDescription>
          {covered} of {total} sold SKUs have ingredient lines ({pct}%).
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>
          Coverage uses active recipes with at least one ingredient. Add recipes on menu items to improve theoretical
          usage.
        </p>
        <Link href="/dashboard/costing/recipes-missing" className="mt-2 inline-block text-primary underline-offset-4 hover:underline">
          Open recipes missing
        </Link>
      </CardContent>
    </Card>
  );
}
