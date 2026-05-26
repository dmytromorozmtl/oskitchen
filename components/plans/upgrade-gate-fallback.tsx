import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeatureKey } from "@/lib/plans/feature-registry";
import type { SubscriptionPlan } from "@prisma/client";

export function UpgradeGateFallback({
  title,
  feature,
  reason,
  currentPlan,
  minimumPlan,
}: {
  title: string;
  feature: FeatureKey;
  reason?: string;
  currentPlan: SubscriptionPlan;
  minimumPlan: SubscriptionPlan;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-6">
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>{title} — plan required</CardTitle>
          <CardDescription>
            Your workspace is on <strong>{currentPlan}</strong>. This area needs{" "}
            <strong>{minimumPlan}</strong> or higher.
            {reason === "trial_ended"
              ? " Your trial has ended — subscribe to unlock integrations and advanced ops."
              : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full">
            <Link href="/dashboard/billing">Open billing</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/pricing">Compare plans</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/book-demo">Book demo</Link>
          </Button>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        Feature key <span className="font-mono">{feature}</span>
      </p>
    </div>
  );
}
