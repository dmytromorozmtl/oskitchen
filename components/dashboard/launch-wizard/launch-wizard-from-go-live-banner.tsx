import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { LaunchWizardFromGoLiveBannerModel } from "@/lib/launch-wizard/launch-wizard-from-go-live-era21";

export function LaunchWizardFromGoLiveBanner(props: {
  model: LaunchWizardFromGoLiveBannerModel;
}) {
  const { model } = props;
  if (!model.visible) return null;

  return (
    <Card
      className="border-amber-200/80 bg-amber-50/25 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20"
      data-testid="launch-wizard-from-go-live-banner"
    >
      <CardContent className="space-y-3 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
              Redirected from Go-live
            </p>
            <p className="text-sm text-muted-foreground">{model.headline}</p>
            <p className="text-xs text-muted-foreground">{model.detail}</p>
          </div>
          <Badge variant="outline" className="rounded-full">
            Pilot gate active
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={model.commercialBlockersHref}>
              View commercial blockers
              <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={model.advancedGoLiveHref}>Advanced go-live (ops only)</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
