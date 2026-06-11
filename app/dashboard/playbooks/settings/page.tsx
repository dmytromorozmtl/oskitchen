import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePlaybooksPageAccess } from "@/lib/playbooks/playbook-page-access";
import { listRecentEvents } from "@/services/playbooks/playbook-service";

export default async function PlaybookSettingsPage() {
  const access = await requirePlaybooksPageAccess("playbooks.edit");
  if (!access.ok) return access.deny;
  const { tenantScope: scope } = access;
  const events = await listRecentEvents(scope, 80);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Playbook Settings & Audit</h1>
        <p className="text-muted-foreground">
          Workspace-level defaults and an audit trail for every playbook change.
        </p>
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Safety defaults</CardTitle>
          <CardDescription>
            Task generation always requires an explicit user action. Auto-execution
            is intentionally disabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>• System templates are read-only — copy into a custom playbook to edit.</p>
          <p>• Generated tasks are linked to the originating run step (idempotent).</p>
          <p>• Cancelling a run records the reason in the audit log.</p>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Audit log</CardTitle>
          <CardDescription>Most recent {events.length} events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 text-left">When</th>
                  <th className="py-2 text-left">Event</th>
                  <th className="py-2 text-left">By</th>
                  <th className="py-2 text-left">Run</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-t border-border/60">
                    <td className="py-2">{e.createdAt.toLocaleString()}</td>
                    <td className="py-2">{e.eventType}</td>
                    <td className="py-2">{e.performedBy}</td>
                    <td className="py-2 font-mono text-xs">{e.runId ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
