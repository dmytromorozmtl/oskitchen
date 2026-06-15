import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMERCIAL_INFLECTION_INTEGRATION_HEALTH_ANCHOR } from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import { formatCommercialInflectionMilestoneLabel } from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import type { IntegrationHealthCommercialInflectionBanner } from "@/lib/integrations/integration-health-commercial-inflection-era28";

export function IntegrationHealthCommercialInflectionBannerPanel(props: {
  banner: IntegrationHealthCommercialInflectionBanner;
}) {
  const { banner } = props;
  if (!banner.visible) return null;

  return (
    <div className="space-y-4" id={COMMERCIAL_INFLECTION_INTEGRATION_HEALTH_ANCHOR.slice(1)}>
      <Card
        className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
        data-testid="integration-health-commercial-inflection-banner"
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
            <TrendingUp className="h-5 w-5 shrink-0" aria-hidden />
            Commercial inflection — honest market gate
          </CardTitle>
          <CardDescription>{banner.headline}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              {formatCommercialInflectionMilestoneLabel(banner.milestone)}
            </Badge>
            <Badge variant="secondary" className="rounded-full text-[10px] tabular-nums">
              pilot {banner.inflection.pilotExecutableScore}/100
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px] tabular-nums">
              governance {banner.inflection.governanceScore}/100
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{banner.registryHonestyLine}</p>
          <p className="text-xs text-muted-foreground">{banner.honestyNote}</p>
          <div className="flex flex-wrap gap-2">
            {banner.nextActions.map((action) => (
              <Button key={action.href} asChild size="sm" variant="outline" className="rounded-full">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
