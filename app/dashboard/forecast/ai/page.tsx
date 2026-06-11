import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { requireForecastAiPageAccess } from "@/lib/forecast/require-forecast-ai-page-access";
import { getAIOrderForecast } from "@/services/ai/kitchen-ai-service";

export default async function AiForecastPage() {
  const access = await requireForecastAiPageAccess();
  if (!access.ok) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold">AI demand forecast</h1>
        <AiFeatureApiError featureName="AI Demand Forecast" error={access.error} />
      </div>
    );
  }

  const forecastLoad = await loadAiFeaturePage(() => getAIOrderForecast(access.dataUserId, 7));
  if (!forecastLoad.ok) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold">AI demand forecast</h1>
        <AiFeatureApiError featureName="AI Demand Forecast" error={forecastLoad.error} />
      </div>
    );
  }

  const forecast = forecastLoad.data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">AI demand forecast</h1>
      <p className="text-sm text-muted-foreground">{forecast.note}</p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">7-day outlook</CardTitle>
          <p className="text-xs text-muted-foreground">
            Confidence {(forecast.confidence * 100).toFixed(0)}% · {forecast.method}
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {forecast.days.map((d) => (
            <div key={d.date} className="flex justify-between border-b py-2">
              <span>{d.date}</span>
              <span>
                ~{d.predictedOrders} orders · ${d.predictedRevenue.toFixed(0)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
