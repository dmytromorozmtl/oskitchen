import Link from "next/link";

import { RunStatusBadge } from "@/components/dashboard/playbooks/playbook-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isOverdue, progressForRun } from "@/lib/playbooks/playbook-runner";
import { requirePlaybooksPageAccess } from "@/lib/playbooks/playbook-page-access";
import { listRuns } from "@/services/playbooks/playbook-service";

export default async function ActiveRunsPage() {
  const access = await requirePlaybooksPageAccess("playbooks.view");
  if (!access.ok) return access.deny;
  const { tenantScope: scope } = access;
  const runs = await listRuns(scope, {
    statuses: ["RUNNING", "BLOCKED", "COMPLETED", "CANCELLED"],
    limit: 50,
  });

  if (runs.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">No playbook runs yet</CardTitle>
          <CardDescription>
            Run a playbook from the Recommended tab to start tracking progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/dashboard/playbooks">Open recommended</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Active Runs</h1>
        <p className="text-muted-foreground">All in-flight, blocked, and recently finished runs.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {runs.map((r) => {
          const progress = progressForRun(r.steps);
          const overdue = isOverdue(r);
          return (
            <Card key={r.id} className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <RunStatusBadge status={r.status} />
                </div>
                <CardDescription>
                  {r.playbook.title}
                  {overdue ? " · overdue" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress.completed + progress.skipped}/{progress.total} · {progress.percent}%
                </p>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/dashboard/playbooks/runs/${r.id}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
