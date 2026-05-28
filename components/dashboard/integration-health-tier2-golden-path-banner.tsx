import Link from "next/link";
import { Route } from "lucide-react";

import { Tier2GoldenPathPhasesPanel } from "@/components/dashboard/tier2-golden-path-phases-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TIER2_GOLDEN_PATH_INTEGRATION_HEALTH_ANCHOR } from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import type { IntegrationHealthTier2GoldenPathBanner } from "@/lib/integrations/integration-health-tier2-golden-path-era21";

export function IntegrationHealthTier2GoldenPathBannerPanel(props: {
  banner: IntegrationHealthTier2GoldenPathBanner;
}) {
  const { banner } = props;
  if (!banner.visible) return null;

  return (
    <div className="space-y-4" id={TIER2_GOLDEN_PATH_INTEGRATION_HEALTH_ANCHOR.slice(1)}>
      <Card
        className="scroll-mt-24 border-blue-200/80 bg-blue-50/20 shadow-sm dark:border-blue-900/50"
        data-testid="integration-health-tier2-golden-path-banner"
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-950 dark:text-blue-100">
            <Route className="h-5 w-5 shrink-0" aria-hidden />
            Tier 2 golden path — not passed
          </CardTitle>
          <CardDescription>{banner.headline}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              {banner.tier2ProofStatus}
            </Badge>
            {banner.overall ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                aggregate: {banner.overall}
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
      <Tier2GoldenPathPhasesPanel slice={banner.goldenPath} />
    </div>
  );
}
