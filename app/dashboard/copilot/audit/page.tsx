import { Card, CardContent } from "@/components/ui/card";
import { createCopilotActorScope } from "@/lib/ai/copilot-actor-scope";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { listAuditEvents } from "@/services/ai/copilot-service";

export default async function CopilotAuditPage() {
  const actor = await requireWorkspacePermissionActor();
  const scope = createCopilotActorScope(actor);
  if (!canUseCopilot(scope, "copilot.read.audit")) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You do not have permission to view the copilot audit log.
        </CardContent>
      </Card>
    );
  }
  const events = await listAuditEvents(scope, 200);
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          Every copilot action — narrative generation, chat turns, action drafts, approvals, and
          settings changes — is recorded. Secrets and PII are never logged.
        </p>
      </header>
      <Card className="border-border/80 shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">By</th>
                <th className="px-3 py-2 font-medium">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                    No events recorded yet.
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="border-b border-border/40">
                    <td className="px-3 py-2 tabular-nums text-xs text-muted-foreground">
                      {e.createdAt.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{e.eventType}</td>
                    <td className="px-3 py-2 text-xs">{e.performedBy}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {e.metadataJson ? JSON.stringify(e.metadataJson) : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
