import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LaunchWizardCommercialBlockersSlice } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import { cn } from "@/lib/utils";

export function LaunchWizardCommercialBlockersPanel(props: {
  slice: LaunchWizardCommercialBlockersSlice;
  compact?: boolean;
}) {
  const { slice, compact = false } = props;
  const decisionVariant =
    slice.decision === "GO"
      ? "default"
      : slice.decision === "NO-GO"
        ? "destructive"
        : "outline";

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="launch-wizard-commercial-blockers"
      id="launch-wizard-commercial-blockers"
    >
      <CardHeader className={cn("pb-3", compact && "py-3")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-muted-foreground" aria-hidden />
              Commercial pilot blockers
            </CardTitle>
            {!compact ? (
              <CardDescription className="mt-1 max-w-2xl">{slice.headline}</CardDescription>
            ) : null}
          </div>
          <Badge variant={decisionVariant} className="rounded-full">
            {slice.decisionLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "pt-0")}>
        {compact ? (
          <p className="text-sm text-muted-foreground">{slice.headline}</p>
        ) : null}
        {slice.blockers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No commercial blockers surfaced — finish workspace setup steps and confirm cutover checklist.
          </p>
        ) : (
          <ul className="space-y-2">
            {slice.blockers.map((blocker) => (
              <li
                key={blocker.id}
                className={cn(
                  "rounded-xl border px-3 py-2.5",
                  blocker.tone === "urgent"
                    ? "border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15"
                    : "border-border/70 bg-background/80",
                )}
                data-testid={`launch-wizard-blocker-${blocker.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{blocker.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{blocker.detail}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-full">
                    <Link href={blocker.href}>
                      Open
                      <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!slice.artifactPresent ? (
          <p className="text-xs text-muted-foreground">
            GO/NO-GO artifact missing — run npm run smoke:pilot-gono-go before contract cutover.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
