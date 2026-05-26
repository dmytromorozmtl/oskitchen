import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AvtReportPayload } from "@/services/costing/avt-report-service";

export function AvtConfidenceCard({ payload }: { payload: AvtReportPayload }) {
  const s = payload.workspaceSummary;
  const variant = s.confidence === "HIGH" ? "default" : s.confidence === "MEDIUM" ? "secondary" : "outline";
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Workspace confidence</CardTitle>
          <Badge variant={variant} className="rounded-full">
            {s.confidence}
          </Badge>
        </div>
        <CardDescription>{s.explanation}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <p className="text-muted-foreground">Active recipes</p>
          <p className="font-mono text-lg tabular-nums">{s.recipeCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Receiving events</p>
          <p className="font-mono text-lg tabular-nums">{s.receivingEventCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Recent order lines (approx)</p>
          <p className="font-mono text-lg tabular-nums">{s.completedOrderLinesApprox}</p>
        </div>
        <div className="sm:col-span-3 text-xs text-muted-foreground">
          <Link href="/dashboard/purchasing" className="text-primary underline-offset-4 hover:underline">
            Purchasing / receiving
          </Link>{" "}
          ·{" "}
          <Link href="/dashboard/costing/recipes-missing" className="text-primary underline-offset-4 hover:underline">
            Recipes missing
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
