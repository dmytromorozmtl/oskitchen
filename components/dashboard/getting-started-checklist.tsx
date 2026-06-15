"use client";

import Link from "next/link";
import { ArrowRight, Check, PartyPopper } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { captureProductEvent } from "@/lib/analytics/product-events";
import {
  gettingStartedStepCta,
  gettingStartedStepDetail,
  pickGettingStartedNextStep,
  shouldCollapseGettingStartedList,
} from "@/lib/onboarding/getting-started-focus-era18";
import type { GettingStartedPayload } from "@/services/onboarding/getting-started-status";
import { cn } from "@/lib/utils";

export function GettingStartedChecklist({
  data,
  showAllSteps = false,
}: {
  data: GettingStartedPayload;
  showAllSteps?: boolean;
}) {
  const [celebrate, setCelebrate] = React.useState(false);

  React.useEffect(() => {
    if (data.allDone) {
      setCelebrate(true);
      captureProductEvent("onboarding_step_completed", { step: "checklist_all", vertical: "all" });
    }
  }, [data.allDone]);

  if (!data.showChecklist && !celebrate) return null;

  const doneCount = data.items.filter((i) => i.done).length;
  const nextStep = pickGettingStartedNextStep(data.items);
  const collapseList = shouldCollapseGettingStartedList({
    showAllSteps,
    allDone: data.allDone,
  });

  if (data.allDone) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PartyPopper className="h-5 w-5 text-emerald-600" aria-hidden />
            You&apos;re set up
          </CardTitle>
          <CardDescription>All getting-started steps complete. Focus on today&apos;s operations.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-3" data-testid="getting-started-checklist">
      {nextStep?.href ? (
        <Card
          className="border-primary/25 bg-primary/[0.03] shadow-sm"
          data-testid="getting-started-next-step"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Next setup step</CardTitle>
            <CardDescription>
              {doneCount} of {data.items.length} complete — most operators finish in under 15 minutes.
            </CardDescription>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={doneCount}
              aria-valuemin={0}
              aria-valuemax={data.items.length}
              aria-label="Getting started progress"
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(doneCount / data.items.length) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
              <p className="font-medium">{nextStep.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{gettingStartedStepDetail(nextStep)}</p>
            </div>
            <Button asChild size="lg" className="h-12 w-full rounded-2xl text-base">
              <Link
                href={nextStep.href}
                data-testid={`getting-started-next-${nextStep.id}`}
                onClick={() =>
                  captureProductEvent("onboarding_step_completed", {
                    step: nextStep.id,
                    vertical: "checklist_next",
                  })
                }
              >
                {gettingStartedStepCta(nextStep)}
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Link>
            </Button>
            {collapseList ? (
              <p className="text-center text-xs text-muted-foreground">
                <Link href="/dashboard/today?checklist=all" className="font-medium text-primary hover:underline">
                  Show all setup steps
                </Link>
              </p>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                <Link href="/dashboard/today" className="font-medium text-primary hover:underline">
                  Focus on next step only
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {!collapseList ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">All setup steps</CardTitle>
            <CardDescription>Work through the pilot golden path in order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
                  item.done && "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50",
                  !item.done && item.id === nextStep?.id && "border-primary/30 bg-primary/[0.04]",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      item.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-muted-foreground/40",
                    )}
                    aria-hidden
                  >
                    {item.done ? <Check className="h-3 w-3" /> : null}
                  </span>
                  {item.label}
                </span>
                {!item.done && item.href ? (
                  <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full">
                    <Link
                      href={item.href}
                      onClick={() =>
                        captureProductEvent("onboarding_step_completed", {
                          step: item.id,
                          vertical: "checklist",
                        })
                      }
                    >
                      Open
                    </Link>
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
