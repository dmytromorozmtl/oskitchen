import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { progressForRun, isOverdue } from "@/lib/playbooks/playbook-runner";
import {
  getPlaybookKpis,
  listRuns,
  recommendedPlaybooksForMode,
} from "@/services/playbooks/playbook-service";
import type { BusinessType } from "@prisma/client";

type Props = {
  userId: string;
  email: string | null;
  businessMode: BusinessType | null;
};

export async function PlaybookTodayStrip({ userId, email, businessMode }: Props) {
  try {
    const scope = { userId, email };
    const [recommended, activeRuns, kpis] = await Promise.all([
      recommendedPlaybooksForMode(scope, businessMode),
      listRuns(scope, { statuses: ["RUNNING", "BLOCKED"], limit: 4 }),
      getPlaybookKpis(scope),
    ]);

    const topPick = recommended[0];

    if (!topPick && activeRuns.length === 0) {
      return null;
    }

    return (
      <PlaybookTodayStripContent
        topPick={topPick}
        activeRuns={activeRuns}
        kpis={kpis}
      />
    );
  } catch (error) {
    console.error("[PlaybookTodayStrip] render failed", error);
    return null;
  }
}

function PlaybookTodayStripContent({
  topPick,
  activeRuns,
  kpis,
}: {
  topPick: Awaited<ReturnType<typeof recommendedPlaybooksForMode>>[number] | undefined;
  activeRuns: Awaited<ReturnType<typeof listRuns>>;
  kpis: Awaited<ReturnType<typeof getPlaybookKpis>>;
}) {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span>Operations Playbooks</span>
          <Link
            href="/dashboard/playbooks"
            className="text-xs font-normal text-muted-foreground hover:text-foreground"
          >
            Open command center →
          </Link>
        </CardTitle>
        <CardDescription>
          {kpis.active} active · {kpis.blockedSteps} blocked steps · {kpis.overdueRuns} overdue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topPick ? (
          <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Recommended for today
            </p>
            <p className="mt-1 font-medium">{topPick.title}</p>
            <p className="text-sm text-muted-foreground">{topPick.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/dashboard/playbooks/${topPick.id}`}>Open playbook</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/playbooks">All playbooks</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {activeRuns.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Active runs
            </p>
            <ul className="space-y-2">
              {activeRuns.map((r) => {
                const progress = progressForRun(r.steps);
                const overdue = isOverdue(r);
                return (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/80 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {progress.percent}% · {progress.blocked} blocked
                        {overdue ? " · overdue" : ""}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/dashboard/playbooks/runs/${r.id}`}>Continue</Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
