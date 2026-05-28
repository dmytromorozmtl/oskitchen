import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { PilotWeek1PhasesPanel } from "@/components/dashboard/pilot-week1-phases-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { IntegrationHealthPilotWeek1Banner } from "@/lib/integrations/integration-health-pilot-week1-era21";
import { PILOT_WEEK1_INTEGRATION_HEALTH_ANCHOR } from "@/lib/integrations/integration-health-pilot-week1-era21";

export function IntegrationHealthPilotWeek1BannerPanel(props: {
  banner: IntegrationHealthPilotWeek1Banner;
}) {
  const { banner } = props;
  if (!banner.visible) return null;

  return (
    <div className="space-y-4" id={PILOT_WEEK1_INTEGRATION_HEALTH_ANCHOR.slice(1)}>
      <Card
        className="scroll-mt-24 border-emerald-200/80 bg-emerald-50/20 shadow-sm dark:border-emerald-900/50"
        data-testid="integration-health-pilot-week1-banner"
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-emerald-950 dark:text-emerald-100">
            <CalendarDays className="h-5 w-5 shrink-0" aria-hidden />
            Pilot Week 1 — Integration Health cadence
          </CardTitle>
          <CardDescription>{banner.headline}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="rounded-full font-mono text-[10px]">
              {banner.goDecision}
            </Badge>
            {banner.customerName ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                {banner.customerName}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{banner.honestyNote}</p>
          <div className="flex flex-wrap gap-2">
            {banner.nextActions.map((action) => (
              <Button key={action.href} asChild size="sm" variant="outline" className="rounded-full">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <PilotWeek1PhasesPanel slice={banner.week1} variant="dashboard" />
    </div>
  );
}
