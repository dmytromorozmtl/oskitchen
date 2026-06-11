import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MOBILE_TODAY_MIN_PLAYBOOK_COUNT,
  MOBILE_TODAY_PLAYBOOK_CARD_CLASS,
  MOBILE_TODAY_PLAYBOOK_GRID_CLASS,
  MOBILE_TODAY_PLAYBOOK_GRID_TEST_ID,
  MOBILE_TODAY_RECOMMENDED_FETCH_LIMIT,
} from "@/lib/design/mobile-today-scroll-policy";
import { progressForRun, isOverdue } from "@/lib/playbooks/playbook-runner";
import { shouldRenderPlaybookTodayStrip } from "@/lib/safety/null-reference-guards";
import { cn } from "@/lib/utils";
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
      recommendedPlaybooksForMode(scope, businessMode, MOBILE_TODAY_RECOMMENDED_FETCH_LIMIT),
      listRuns(scope, { statuses: ["RUNNING", "BLOCKED"], limit: 4 }),
      getPlaybookKpis(scope),
    ]);

    if (!shouldRenderPlaybookTodayStrip(recommended, activeRuns)) {
      return null;
    }

    return (
      <PlaybookTodayStripContent
        recommended={recommended}
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
  recommended,
  activeRuns,
  kpis,
}: {
  recommended: Awaited<ReturnType<typeof recommendedPlaybooksForMode>>;
  activeRuns: Awaited<ReturnType<typeof listRuns>>;
  kpis: Awaited<ReturnType<typeof getPlaybookKpis>>;
}) {
  const topPick = recommended[0];

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
          {recommended.length >= MOBILE_TODAY_MIN_PLAYBOOK_COUNT
            ? ` · ${recommended.length} recommended`
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommended.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Recommended for today
            </p>
            <div
              className={MOBILE_TODAY_PLAYBOOK_GRID_CLASS}
              data-testid={MOBILE_TODAY_PLAYBOOK_GRID_TEST_ID}
            >
              {recommended.map((playbook, index) => (
                <div
                  key={playbook.id}
                  className={cn(
                    MOBILE_TODAY_PLAYBOOK_CARD_CLASS,
                    index === 0 && topPick ? "border-primary/25 bg-primary/[0.04]" : "",
                  )}
                >
                  <p className="font-medium leading-snug">{playbook.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {playbook.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/playbooks/${playbook.id}`}>Open</Link>
                    </Button>
                    {index === 0 ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/dashboard/playbooks">All playbooks</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
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
