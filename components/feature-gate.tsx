import Link from "next/link";

import type { SubscriptionPlan } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type GatedFeature,
  planAllowsFeature,
  requiredPlanForFeature,
} from "@/lib/feature-access";

export function FeatureGate({
  plan,
  feature,
  children,
  title = "Upgrade to unlock",
}: {
  plan: SubscriptionPlan;
  feature: GatedFeature;
  children: React.ReactNode;
  title?: string;
}) {
  if (planAllowsFeature(plan, feature)) {
    return <>{children}</>;
  }

  const need = requiredPlanForFeature(feature);

  return (
    <Card className="border-dashed border-primary/40 bg-muted/20">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="secondary" className="rounded-full">
            {need}+ plan
          </Badge>
        </div>
        <CardDescription>
          This capability is included on higher tiers so we can support real multi-channel
          volume and priority workflows.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild className="rounded-full" variant="premium">
          <Link href="/dashboard/billing">View plans</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/demo">See demo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
