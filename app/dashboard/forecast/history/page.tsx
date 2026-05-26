import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FORECAST_TYPE_LABEL } from "@/lib/forecast/forecast-types";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listForecastRuns } from "@/services/forecast/forecast-service";

export default async function ForecastHistoryPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const runs = await listForecastRuns(dataUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Forecast history</h1>
        <p className="text-muted-foreground">All previous runs, newest first.</p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Runs</CardTitle>
          <CardDescription>
            We do not synthesise accuracy. Once enough completed runs and matching orders exist,
            forecast-vs-actual reporting will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {runs.length === 0 ? <p className="text-sm text-muted-foreground">No forecast runs yet.</p> : null}
          {runs.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/forecast/${r.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {FORECAST_TYPE_LABEL[r.forecastType]} · {r.dateFrom.toISOString().slice(0, 10)} → {r.dateTo.toISOString().slice(0, 10)} · {r.createdAt.toISOString().slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="rounded-full capitalize">{r.status.toLowerCase()}</Badge>
                <Badge variant="outline" className="rounded-full capitalize">{r.confidence.toLowerCase()}</Badge>
                <Badge variant="outline" className="rounded-full">{r._count.lines} lines</Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
