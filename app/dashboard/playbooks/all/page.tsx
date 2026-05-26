import Link from "next/link";

import { StartRunButton } from "@/components/dashboard/playbooks/start-run-button";
import { Badge } from "@/components/ui/badge";
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

export default async function AllPlaybooksPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const scope = { userId: dataUserId, email: user.email ?? null };
  const playbooks = await listPlaybooks(scope, {});

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All Playbooks</h1>
        <p className="text-muted-foreground">
          Every playbook in the workspace — system templates and custom SOPs.
        </p>
      </div>

      {playbooks.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">No playbooks yet</CardTitle>
            <CardDescription>
              Use system playbooks or create your own SOPs.
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
          {playbooks.map((p) => (
            <Card key={p.id} className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  {p.systemTemplate ? (
                    <Badge variant="secondary" className="rounded-full text-xs">
                      System
                    </Badge>
                  ) : (
                    <Badge className="rounded-full text-xs">Custom</Badge>
                  )}
                </div>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  {p.steps.length} steps · {p._count.runs} runs ·{" "}
                  {p.type.replaceAll("_", " ").toLowerCase()}
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
