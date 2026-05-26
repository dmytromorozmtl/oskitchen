import Link from "next/link";
import { notFound } from "next/navigation";

import { StartRunButton } from "@/components/dashboard/playbooks/start-run-button";
import { RunStatusBadge } from "@/components/dashboard/playbooks/playbook-status-badge";
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
import { getPlaybook } from "@/services/playbooks/playbook-service";

type Params = { playbookId: string };

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { playbookId } = await params;
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const scope = { userId: dataUserId, email: user.email ?? null };
  const playbook = await getPlaybook(scope, playbookId);
  if (!playbook) notFound();

  const businessModes = (playbook.businessModesJson as string[] | null) ?? [];
  const modules = (playbook.recommendedModulesJson as string[] | null) ?? [];
  const roles = (playbook.defaultRolesJson as string[] | null) ?? [];
  const totalMinutes = playbook.steps.reduce(
    (acc, s) => acc + (s.estimatedMinutes ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{playbook.title}</h1>
            {playbook.systemTemplate ? (
              <Badge variant="secondary" className="rounded-full text-xs">
                System
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 max-w-3xl text-muted-foreground">{playbook.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {businessModes.map((m) => (
              <Badge key={m} variant="outline" className="rounded-full text-xs">
                {m}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StartRunButton playbookId={playbook.id} label="Run playbook" />
          <Button asChild variant="outline">
            <Link href="/dashboard/playbooks">Back</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Estimated time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{totalMinutes} min</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {roles.length ? roles.join(", ") : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {modules.length ? modules.join(", ") : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Steps</CardTitle>
          <CardDescription>
            Walk-through order. Required steps generate tasks; optional steps can be skipped.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {playbook.steps.map((s, idx) => (
              <li
                key={s.id}
                className="rounded-lg border border-border/80 bg-muted/10 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {idx + 1}. {s.title}{" "}
                      {!s.required ? (
                        <span className="text-xs text-muted-foreground">(optional)</span>
                      ) : null}
                    </p>
                    {s.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {s.recommendedRole ? <span>Role: {s.recommendedRole}</span> : null}
                    {s.estimatedMinutes ? <span>{s.estimatedMinutes} min</span> : null}
                    {s.moduleKey ? <span>Module: {s.moduleKey}</span> : null}
                    {s.actionRoute ? (
                      <Link
                        href={s.actionRoute}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        Open module
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent runs</CardTitle>
        </CardHeader>
        <CardContent>
          {playbook.runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {playbook.runs.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 p-2"
                >
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Started {r.startedAt.toLocaleString()} · {r._count.steps} steps
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RunStatusBadge status={r.status} />
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/playbooks/runs/${r.id}`}>Open</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
