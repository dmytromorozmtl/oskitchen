import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { P0OpsVaultPhasesPanel } from "@/components/dashboard/p0-ops-vault-phases-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INTEGRATION_HEALTH_P0_TRUST_BANNER_ANCHOR } from "@/lib/integrations/integration-health-trust-layer-era20-policy";
import type { IntegrationHealthP0TrustBanner } from "@/lib/integrations/integration-health-trust-layer-era20";

export function IntegrationHealthP0TrustBannerPanel(props: {
  banner: IntegrationHealthP0TrustBanner;
}) {
  const { banner } = props;
  if (!banner.visible) return null;

  return (
    <div className="space-y-4" id={INTEGRATION_HEALTH_P0_TRUST_BANNER_ANCHOR.slice(1)}>
      <Card
        className="scroll-mt-24 border-amber-200/80 bg-amber-50/20 shadow-sm dark:border-amber-900/50"
        data-testid="integration-health-p0-trust-banner"
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-amber-950 dark:text-amber-100">
            <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
            P0 staging proof — not passed
          </CardTitle>
          <CardDescription className="text-amber-900/80 dark:text-amber-200/80">
            {banner.headline}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              {banner.p0ProofStatus}
            </Badge>
            {banner.overall ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                aggregate: {banner.overall}
              </Badge>
            ) : null}
            {banner.missingCount > 0 ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                {banner.missingCount} env var{banner.missingCount === 1 ? "" : "s"} missing
              </Badge>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">{banner.honestyNote}</p>

          <ul className="list-inside list-disc text-xs text-muted-foreground">
            {banner.smokeScripts.map((script) => (
              <li key={script}>{script}</li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            {banner.nextActions.map((action) => (
              <Button key={action.href} asChild size="sm" variant="outline" className="rounded-full">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <P0OpsVaultPhasesPanel slice={banner.opsVault} />
    </div>
  );
}
