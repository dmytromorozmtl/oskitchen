import { TrainingKpiGrid } from "@/components/dashboard/training/kpi-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL } from "@/lib/training/training-engine";
import {
  listEvents,
  trainingKpis,
} from "@/services/training/training-service";

function bar(percent: number) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-muted">
      <div className="h-full bg-emerald-500" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default async function AnalyticsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const [kpis, events, programs] = await Promise.all([
    trainingKpis(dataUserId),
    listEvents(dataUserId, 30),
    prisma.trainingProgram.findMany({
      where: { userId: dataUserId },
      select: {
        id: true, title: true, roleType: true,
        assignments: { select: { completionPercent: true, status: true } },
      },
    }),
  ]);

  const byRole = new Map<string, { total: number; completed: number }>();
  for (const p of programs) {
    const key = ROLE_LABEL[p.roleType];
    const entry = byRole.get(key) ?? { total: 0, completed: 0 };
    entry.total += p.assignments.length;
    entry.completed += p.assignments.filter((a) => a.status === "COMPLETED").length;
    byRole.set(key, entry);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Training analytics</h1>
        <p className="text-sm text-muted-foreground">
          Completion, certification coverage, simulation outcomes, and operational readiness.
        </p>
      </div>

      <TrainingKpiGrid tiles={kpis} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Completion by role</CardTitle>
          <CardDescription>Assignments completed divided by total assignments per role.</CardDescription>
        </CardHeader>
        <CardContent>
          {byRole.size === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="space-y-3">
              {[...byRole.entries()].map(([role, stats]) => {
                const percent = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
                return (
                  <li key={role}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span>{role}</span>
                      <span className="text-muted-foreground">{stats.completed}/{stats.total} · {percent}%</span>
                    </div>
                    {bar(percent)}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent training activity</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {events.map((e) => (
                <li key={e.id} className="rounded border px-2 py-1">
                  <span className="font-mono">{e.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
                  {" · "}
                  <span className="font-medium">{e.eventType}</span>
                  {e.summary ? ` · ${e.summary}` : ""}
                  {e.performedBy?.fullName ? ` · ${e.performedBy.fullName}` : ""}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
