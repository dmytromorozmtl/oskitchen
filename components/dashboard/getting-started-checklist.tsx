"use client";

import Link from "next/link";
import { Check, PartyPopper } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { captureProductEvent } from "@/lib/analytics/product-events";
import type { GettingStartedPayload } from "@/services/onboarding/getting-started-status";
import { cn } from "@/lib/utils";

export function GettingStartedChecklist({ data }: { data: GettingStartedPayload }) {
  const [celebrate, setCelebrate] = React.useState(false);

  React.useEffect(() => {
    if (data.allDone) {
      setCelebrate(true);
      captureProductEvent("onboarding_step_completed", { step: "checklist_all", vertical: "all" });
    }
  }, [data.allDone]);

  if (!data.showChecklist && !celebrate) return null;

  const doneCount = data.items.filter((i) => i.done).length;

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Getting started</CardTitle>
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
      <CardContent className="space-y-2">
        {data.items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
              item.done && "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50",
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
  );
}
