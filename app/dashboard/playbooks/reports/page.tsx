import { PlaybookKpis } from "@/components/dashboard/playbooks/playbook-kpis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { getPlaybookKpis } from "@/services/playbooks/playbook-service";

export default async function PlaybookReportsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const scope = { userId: dataUserId, email: user.email ?? null };
  const kpis = await getPlaybookKpis(scope);

  const recentRuns = await prisma.playbookRun.findMany({
    where: { userId: dataUserId },
    orderBy: { startedAt: "desc" },
    take: 25,
    include: { playbook: { select: { title: true } } },
  });

  const completed = recentRuns.filter((r) => r.status === "COMPLETED");
  const avgMinutes =
    completed.length === 0
      ? 0
      : Math.round(
          completed.reduce((acc, r) => {
            if (!r.completedAt) return acc;
            return acc + (r.completedAt.getTime() - r.startedAt.getTime()) / 60000;
          }, 0) / completed.length,
        );

  const byBusinessMode = recentRuns.reduce<Record<string, number>>((acc, r) => {
    const mode = r.businessMode ?? "—";
    acc[mode] = (acc[mode] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Playbook Reports</h1>
        <p className="text-muted-foreground">
          Completion, blockers, and workflow usage across recent runs.
        </p>
      </div>

      <PlaybookKpis
        tiles={[
          { label: "Completed today", value: kpis.completedToday },
          { label: "Active runs", value: kpis.active },
          { label: "Blocked steps", value: kpis.blockedSteps },
          { label: "Overdue runs", value: kpis.overdueRuns },
          { label: "Avg minutes / run", value: avgMinutes },
          { label: "Tasks generated", value: kpis.tasksGenerated },
        ]}
      />

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent runs</CardTitle>
          <CardDescription>Last 25 runs across your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 text-left">Playbook</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Started</th>
                  <th className="py-2 text-left">Completed</th>
                  <th className="py-2 text-left">Mode</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="py-2">{r.playbook.title}</td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2">{r.startedAt.toLocaleString()}</td>
                    <td className="py-2">{r.completedAt?.toLocaleString() ?? "—"}</td>
                    <td className="py-2">{r.businessMode ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Workflow usage by business mode</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {Object.entries(byBusinessMode).map(([mode, count]) => (
              <li key={mode} className="flex items-center justify-between">
                <span>{mode}</span>
                <span className="tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
