import { CopilotInsightCard } from "@/components/dashboard/copilot/insight-card";
import { Card, CardContent } from "@/components/ui/card";
import { createCopilotActorScope } from "@/lib/ai/copilot-actor-scope";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { listOpenInsights, persistDeterministicInsights } from "@/services/ai/copilot-service";

export default async function CopilotInsightsPage() {
  const actor = await requireWorkspacePermissionActor();
  const scope = createCopilotActorScope(actor);
  if (!canUseCopilot(scope, "copilot.view")) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You do not have permission to view copilot insights.
        </CardContent>
      </Card>
    );
  }
  await persistDeterministicInsights(scope);
  const insights = await listOpenInsights(scope, 100);
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Open insights</h1>
        <p className="text-sm text-muted-foreground">
          Deterministic operational signals from your KitchenOS workspace. Resolve once handled.
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
