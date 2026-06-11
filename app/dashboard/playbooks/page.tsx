import Link from "next/link";

import { ensureSystemPlaybooksAction } from "@/actions/playbooks";
import { PlaybookKpis } from "@/components/dashboard/playbooks/playbook-kpis";
import { RunStatusBadge } from "@/components/dashboard/playbooks/playbook-status-badge";
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
import { BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { canUsePlaybooks } from "@/lib/playbooks/playbook-permissions";
import { requirePlaybooksPageAccess } from "@/lib/playbooks/playbook-page-access";
import { progressForRun } from "@/lib/playbooks/playbook-runner";
import { prisma } from "@/lib/prisma";
import {
  getPlaybookKpis,
  listRuns,
  recommendedPlaybooksForMode,
} from "@/services/playbooks/playbook-service";

export default async function PlaybooksRecommendedPage() {
  const access = await requirePlaybooksPageAccess("playbooks.view");
  if (!access.ok) return access.deny;
  await ensureSystemPlaybooksAction();

  const { tenantScope: scope, scope: actorScope } = access;
  const dataUserId = scope.userId;
  const canCreateCustom = canUsePlaybooks(actorScope, "playbooks.create_custom");
  const canRun = canUsePlaybooks(actorScope, "playbooks.run");

  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId: dataUserId },
    select: { businessType: true },
  });
  const mode = settings?.businessType ?? null;
  const modeLabel = mode ? BUSINESS_TYPE_LABELS[mode] : null;

  const [recommended, kpis, activeRuns] = await Promise.all([
    recommendedPlaybooksForMode(scope, mode),
    getPlaybookKpis(scope),
    listRuns(scope, { statuses: ["RUNNING", "BLOCKED"], limit: 6 }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Operations Playbooks</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Run repeatable SOPs, generate staff tasks, track completion, and keep
            daily operations consistent.
          </p>
          {modeLabel ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Highlighting playbooks for{" "}
              <span className="font-medium text-foreground">{modeLabel}</span>.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreateCustom ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/playbooks/new">Create custom playbook</Link>
            </Button>
          ) : null}
          {canRun ? (
            <Button asChild className="rounded-full">
              <Link href="/dashboard/playbooks/all">Run playbook</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <PlaybookKpis
        tiles={[
          { label: "Active runs", value: kpis.active },
          { label: "Completed today", value: kpis.completedToday },
          { label: "Blocked steps", value: kpis.blockedSteps },
          { label: "Overdue runs", value: kpis.overdueRuns },
          { label: "Templates", value: kpis.templates },
          { label: "Tasks generated", value: kpis.tasksGenerated },
        ]}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended for your mode
          </h2>
          <Link
            href="/dashboard/playbooks/all"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            See all →
          </Link>
        </div>
        {recommended.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">No recommended playbooks yet</CardTitle>
              <CardDescription>
                Use a system template or create your own SOP for prep, production,
                packing, delivery, catering, and daily operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href="/dashboard/playbooks/templates">Use system template</Link>
              </Button>
              {canCreateCustom ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/playbooks/new">Create custom playbook</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {recommended.map((p) => {
              const modules = ((p.recommendedModulesJson as string[] | null) ?? []).join(", ");
              const roles = ((p.defaultRolesJson as string[] | null) ?? []).join(", ");
              return (
                <Card key={p.id} className="border-primary/20 bg-primary/[0.04] shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {p.type.replaceAll("_", " ").toLowerCase()}
                      </Badge>
                    </div>
                    <CardDescription>{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                      {p.steps.slice(0, 4).map((s) => (
                        <li key={s.id}>{s.title}</li>
                      ))}
                      {p.steps.length > 4 ? (
                        <li className="text-xs">+ {p.steps.length - 4} more</li>
                      ) : null}
                    </ul>
                    {modules ? (
                      <p className="text-xs text-muted-foreground">Modules: {modules}</p>
                    ) : null}
                    {roles ? (
                      <p className="text-xs text-muted-foreground">Roles: {roles}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <StartRunButton playbookId={p.id} label="Run" size="sm" />
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/playbooks/${p.id}`}>Open</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Active runs
          </h2>
          <Link
            href="/dashboard/playbooks/active"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            See all →
          </Link>
        </div>
        {activeRuns.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">No active playbook runs</CardTitle>
              <CardDescription>
                Start a playbook to generate tasks and guide the team through an
                operational workflow.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {activeRuns.map((r) => {
              const progress = progressForRun(r.steps);
              return (
                <Card key={r.id} className="border-border/80 bg-card/90 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{r.title}</CardTitle>
                      <RunStatusBadge status={r.status} />
                    </div>
                    <CardDescription>{r.playbook.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {progress.completed + progress.skipped}/{progress.total} steps · {progress.percent}%
                    </p>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/dashboard/playbooks/runs/${r.id}`}>Open run</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
