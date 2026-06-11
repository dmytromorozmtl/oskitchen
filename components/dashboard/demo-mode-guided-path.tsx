"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ArrowRight, Check, Map, PartyPopper, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { captureProductEvent } from "@/lib/analytics/product-events";
import {
  DEMO_MODE_GUIDED_PATH_STEPS,
  isDemoModeGuidedPathComplete,
  pickDemoModeGuidedPathNextStep,
  type DemoModeGuidedPathStepId,
} from "@/lib/ux/demo-mode-guided-path-policy";
import {
  dismissDemoModeGuidedPath,
  startDemoModeGuidedPath,
  syncDemoModeGuidedPathFromPathname,
} from "@/lib/ux/demo-mode-guided-path-progress";
import { cn } from "@/lib/utils";

function CompleteCard({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30",
        className,
      )}
      data-testid="demo-mode-guided-path-complete"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PartyPopper className="h-5 w-5 text-emerald-600" aria-hidden />
          Demo tour complete
        </CardTitle>
        <CardDescription>
          You visited Today, Quick Start, Invoice Scanner, Marketplace, and KDS — the core pilot
          surfaces.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function DemoModeGuidedPath({
  variant = "card",
  className,
}: {
  variant?: "card" | "strip";
  className?: string;
}) {
  const pathname = usePathname() ?? "/dashboard/today";
  const [completed, setCompleted] = React.useState<DemoModeGuidedPathStepId[]>([]);

  React.useEffect(() => {
    const synced = syncDemoModeGuidedPathFromPathname(pathname);
    setCompleted(synced);
    const step = DEMO_MODE_GUIDED_PATH_STEPS.find(
      (s) => pathname === s.routePrefix || pathname.startsWith(`${s.routePrefix}/`),
    );
    if (step) {
      captureProductEvent("demo_guided_path_step", { step: step.id, route: pathname });
    }
  }, [pathname]);

  const complete = isDemoModeGuidedPathComplete(completed);
  const nextStep = pickDemoModeGuidedPathNextStep(completed);
  const doneCount = completed.length;
  const onToday = pathname === "/dashboard/today" || pathname.startsWith("/dashboard/today/");

  function handleRestart() {
    startDemoModeGuidedPath();
    const synced = syncDemoModeGuidedPathFromPathname(pathname);
    setCompleted(synced);
    captureProductEvent("demo_guided_path_started", { route: pathname });
  }

  function handleDismiss() {
    dismissDemoModeGuidedPath();
    setCompleted(DEMO_MODE_GUIDED_PATH_STEPS.map((step) => step.id));
    captureProductEvent("demo_guided_path_dismissed", { route: pathname });
  }

  if (variant === "strip") {
    if (complete || onToday) return null;
    if (!nextStep) return null;
    return (
      <div
        className={cn(
          "mb-4 flex flex-col gap-2 rounded-2xl border border-primary/25 bg-primary/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
        data-testid="demo-mode-guided-path-strip"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Demo guided path · {doneCount}/{DEMO_MODE_GUIDED_PATH_STEPS.length}
          </p>
          <p className="truncate text-sm font-medium">Next: {nextStep.title}</p>
          <p className="text-xs text-muted-foreground">{nextStep.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full">
            <Link href={nextStep.href}>
              Continue
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="rounded-full"
            onClick={handleDismiss}
            aria-label="Dismiss demo guided path"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    );
  }

  if (!onToday) return null;
  if (complete) return <CompleteCard className={className} />;

  return (
    <Card
      className={cn("border-sky-500/30 bg-sky-500/[0.04] shadow-sm", className)}
      data-testid="demo-mode-guided-path"
    >
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Map className="h-5 w-5 text-sky-600" aria-hidden />
            Demo guided path
          </CardTitle>
          <CardDescription>
            Walk the pilot surfaces in order — {doneCount} of {DEMO_MODE_GUIDED_PATH_STEPS.length}{" "}
            visited. Sample data stays isolated until you import or upgrade.
          </CardDescription>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={DEMO_MODE_GUIDED_PATH_STEPS.length}
            aria-label="Demo guided path progress"
          >
            <div
              className="h-full rounded-full bg-sky-600 transition-all"
              style={{ width: `${(doneCount / DEMO_MODE_GUIDED_PATH_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {nextStep ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href={nextStep.href}>
                Continue to {nextStep.title}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={handleRestart}>
            Restart tour
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {DEMO_MODE_GUIDED_PATH_STEPS.map((step, index) => {
            const done = completed.includes(step.id);
            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-2 text-sm",
                  done
                    ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-border/70 bg-background/60",
                )}
                data-testid={`demo-mode-guided-path-step-${step.id}`}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    done ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {!done ? (
                  <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
                    <Link href={step.href}>Open</Link>
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

export function DemoModeGuidedPathHost({ demoMode }: { demoMode: boolean }) {
  if (!demoMode) return null;
  return <DemoModeGuidedPath variant="strip" />;
}
