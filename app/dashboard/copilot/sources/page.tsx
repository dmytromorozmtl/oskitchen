import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createCopilotActorScope } from "@/lib/ai/copilot-actor-scope";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import { COPILOT_SOURCE_KEYS, COPILOT_SOURCE_REGISTRY } from "@/lib/ai/copilot-sources";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

const PII_COLOR: Record<string, string> = {
  NONE: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  LOW: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
  MEDIUM: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  HIGH: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
};

export default async function CopilotSourcesPage() {
  const actor = await requireWorkspacePermissionActor();
  const scope = createCopilotActorScope(actor);
  if (!canUseCopilot(scope, "copilot.view")) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You do not have permission to view copilot data sources.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Data sources</h1>
        <p className="text-sm text-muted-foreground">
          What the copilot is allowed to read, with the redaction level applied before any AI call.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {COPILOT_SOURCE_KEYS.map((k) => {
          const s = COPILOT_SOURCE_REGISTRY[k];
          return (
            <Card key={s.key} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{s.label}</CardTitle>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PII_COLOR[s.piiLevel]}`}>
                    PII: {s.piiLevel}
                  </span>
                </div>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 pt-0 text-xs text-muted-foreground">
                <p>Allowed roles: {s.allowedRoles.join(", ")}</p>
                <p>Max rows per summary: {s.maxRows}</p>
                <p>Recommended redaction: {s.recommendedRedaction.toLowerCase().replaceAll("_", " ")}</p>
                {s.staleDataWarning && <p className="text-amber-600 dark:text-amber-400">{s.staleDataWarning}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
