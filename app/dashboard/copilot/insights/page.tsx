import { CopilotInsightCard } from "@/components/dashboard/copilot/insight-card";
import { Card, CardContent } from "@/components/ui/card";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { listOpenInsights, persistDeterministicInsights } from "@/services/ai/copilot-service";

export default async function CopilotInsightsPage() {
  const { scope } = await loadCopilotPageActor();
  await persistDeterministicInsights(scope);
  const insights = await listOpenInsights(scope, 100);
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Open insights</h1>
        <p className="text-sm text-muted-foreground">
          Deterministic operational signals from your OS Kitchen workspace. Resolve once handled.
        </p>
      </header>
      {insights.length === 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="py-6 text-sm text-muted-foreground">
            No open insights.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {insights.map((i) => (
            <CopilotInsightCard
              key={i.id}
              id={i.id}
              severity={i.severity}
              title={i.title}
              summary={i.summary}
              recommendedAction={i.recommendedAction}
              actionRoute={i.actionRoute}
              canResolve
            />
          ))}
        </div>
      )}
    </div>
  );
}
