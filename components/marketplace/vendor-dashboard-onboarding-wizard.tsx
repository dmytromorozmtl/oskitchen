"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, CircleDot, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  summarizeVendorOnboarding,
  VENDOR_ONBOARDING_DISMISS_STORAGE_KEY,
  VENDOR_ONBOARDING_WIZARD_TEST_ID,
  type VendorOnboardingSnapshot,
  type VendorOnboardingStep,
} from "@/lib/marketplace/vendor-dashboard-onboarding-wizard-policy";
import { cn } from "@/lib/utils";

function StepIcon({ step }: { step: VendorOnboardingStep }) {
  if (step.status === "complete") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />;
  }
  if (step.status === "current") {
    return <CircleDot className="h-4 w-4 shrink-0 text-primary" aria-hidden />;
  }
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />;
}

export function VendorDashboardOnboardingWizard({
  snapshot,
}: {
  snapshot: VendorOnboardingSnapshot;
}) {
  const [dismissed, setDismissed] = useState(false);
  const summary = summarizeVendorOnboarding(snapshot);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(VENDOR_ONBOARDING_DISMISS_STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (summary.allComplete || dismissed) {
    return null;
  }

  function dismiss() {
    try {
      localStorage.setItem(VENDOR_ONBOARDING_DISMISS_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  const current = summary.currentStep ?? summary.steps.find((step) => !step.complete) ?? summary.steps[0];

  return (
    <Card
      className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm"
      data-testid={VENDOR_ONBOARDING_WIZARD_TEST_ID}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Marketplace setup
            </p>
            <CardTitle className="text-lg">Get ready for your first sale</CardTitle>
            <CardDescription>
              {summary.completedCount} of {summary.totalSteps} steps complete — follow the checklist
              below. Platform verification is required before listings go live.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            aria-label="Dismiss setup checklist"
            onClick={dismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Setup progress</span>
            <span>{summary.progressPercent}%</span>
          </div>
          <Progress value={summary.progressPercent} aria-label="Vendor onboarding progress" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="grid gap-2 sm:grid-cols-2" aria-label="Vendor onboarding steps">
          {summary.steps.map((step) => (
            <li
              key={step.id}
              className={cn(
                "flex gap-3 rounded-xl border px-3 py-2.5 text-sm",
                step.status === "current"
                  ? "border-primary/40 bg-primary/5"
                  : step.status === "complete"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border/70 bg-muted/20",
              )}
            >
              <StepIcon step={step} />
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        {current ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="rounded-full">
              <Link href={current.href}>{current.ctaLabel}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/vendor/register/status">View verification status</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
