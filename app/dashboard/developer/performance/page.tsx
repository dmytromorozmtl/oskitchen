import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { getPlatformAnalyticsStub } from "@/services/developer/platform-analytics-service";

export default async function DeveloperPerformancePage() {
  await requireDeveloperCenterAccess();
  const stub = getPlatformAnalyticsStub();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Performance</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{stub.note}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Window</CardDescription>
            <CardTitle>{stub.window}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>API p50</CardDescription>
            <CardTitle>{stub.apiLatencyP50Ms ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>API p95</CardDescription>
            <CardTitle>{stub.apiLatencyP95Ms ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charts</CardTitle>
          <CardDescription>24h · 7d · 30d rollups appear here once metrics export is configured.</CardDescription>
        </CardHeader>
        <CardContent className="h-40 rounded-lg border border-dashed border-border/80 bg-muted/20" />
      </Card>
    </div>
  );
}
