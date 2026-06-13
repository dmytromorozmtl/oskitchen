import Link from "next/link";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OnboardingTtvPayload } from "@/services/onboarding/onboarding-ttv-service";

export function OnboardingTtvStrip(props: { data: OnboardingTtvPayload }) {
  if (!props.data.showStrip) return null;

  const { measurement, headline } = props.data;
  const isSuccess = measurement.status === "met_target";
  const isOverdue =
    measurement.status === "pending_overdue" || measurement.status === "missed_target";

  const Icon = isSuccess ? CheckCircle2 : isOverdue ? AlertTriangle : Clock;
  const borderClass = isSuccess
    ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
    : isOverdue
      ? "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
      : "border-sky-200/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20";

  return (
    <Card className={`shadow-sm ${borderClass}`} data-testid="onboarding-ttv-strip">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          Time to first order
        </CardTitle>
        <CardDescription>
          Target: {measurement.targetMinutes} minutes from signup to first order received.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-medium">{headline}</p>
        {measurement.ttvMinutes != null ? (
          <p className="text-xs text-muted-foreground">
            Measured TTV: {measurement.ttvMinutes} min · Signup{" "}
            {new Date(measurement.signupAt).toLocaleDateString()}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Elapsed since signup: {measurement.elapsedMinutesSinceSignup} min
          </p>
        )}
        {!measurement.firstOrderAt ? (
          <Link
            href="/dashboard/orders/new"
            className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Create or receive your first order →
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
