import { AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { loadRevenueForecast } from "@/services/analytics/forecast-service";

export default async function ForecastingPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const forecast = await loadRevenueForecast({ userId: dataUserId });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Forecasting</h1>
        <p className="text-muted-foreground">
          Forecasts are <span className="font-medium">estimates</span> based on a trailing
          moving average of the last 90 days of revenue. OS Kitchen never invents numbers — when
          history is insufficient we say so explicitly.
        </p>
      </div>

      {forecast.insufficientHistory ? (
        <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-base">Forecasting needs more history</CardTitle>
            <CardDescription>
              OS Kitchen begins forecasting once enough operational history exists (≥ 7 days of orders).
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Revenue history (last 90d)</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDailyArea data={forecast.history} formatValue={formatCurrency} />
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Estimated revenue (next 14d)</CardTitle>
              <CardDescription>
                Moving-average projection. {forecast.warning ?? "Use as guidance, not a guarantee."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsDailyArea data={forecast.forecast} formatValue={formatCurrency} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
