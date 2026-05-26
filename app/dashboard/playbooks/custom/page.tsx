import Link from "next/link";

import { StartRunButton } from "@/components/dashboard/playbooks/start-run-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listPlaybooks } from "@/services/playbooks/playbook-service";

export default async function CustomPlaybooksPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const scope = { userId: dataUserId, email: user.email ?? null };
  const custom = await listPlaybooks(scope, { customOnly: true });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Custom Playbooks</h1>
          <p className="text-muted-foreground">
            SOPs your team has authored. Edit, archive, or run them.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/playbooks/new">New custom playbook</Link>
        </Button>
      </div>

      {custom.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">No custom playbooks yet</CardTitle>
            <CardDescription>
              Create your first SOP — define steps, roles, and module links so the
              team has a clear workflow to follow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/dashboard/playbooks/new">Create custom playbook</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {custom.map((p) => (
            <Card key={p.id} className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  {p.steps.length} steps · {p._count.runs} runs
                </div>
                <div className="flex flex-wrap gap-2">
                  <StartRunButton playbookId={p.id} label="Run" size="sm" />
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/playbooks/${p.id}`}>Open</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
