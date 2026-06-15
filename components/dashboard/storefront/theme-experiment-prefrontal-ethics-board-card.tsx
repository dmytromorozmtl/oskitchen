import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluatePrefrontalEthicsBoardGate,
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { EthicsReviewQueueActions } from "@/components/dashboard/storefront/ethics-review-queue-actions";

export function ThemeExperimentPrefrontalEthicsBoardCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const board = readPrefrontalEthicsBoard(themeExperimentJson);
  const gate = evaluatePrefrontalEthicsBoardGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Prefrontal ethics board</CardTitle>
        <CardDescription>Human-in-the-loop executive veto before publish (AD4).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isPrefrontalEthicsBoardEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isPrefrontalEthicsBoardEnabled()
            ? "Ethics board enabled"
            : "Set THEME_EXPERIMENT_PREFRONTAL_ETHICS_BOARD=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {board ? (
          <>
            <p className="font-mono text-xs">
              queue {board.queue.length} · pending {board.pendingCount} · veto{" "}
              {board.publishVetoActive ? "yes" : "no"}
            </p>
            {board.queue.length > 0 ? (
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {board.queue.slice(-5).map((q) => (
                  <li key={q.reviewId} className="font-mono">
                    {q.status} · {q.armId ?? "—"} · {q.rationale.slice(0, 48)}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
        {board ? (
          <EthicsReviewQueueActions
            pendingReviews={board.queue.filter((q) => q.status === "pending")}
          />
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/prefrontal-ethics-board-sync</p>
      </CardContent>
    </Card>
  );
}
