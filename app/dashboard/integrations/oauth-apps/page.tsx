import Link from "next/link";
import { headers } from "next/headers";

import { PartnerOAuthAppsPanel } from "@/components/dashboard/oauth/partner-oauth-apps-panel";
import { PilotBetaSurfaceBanner } from "@/components/dashboard/pilot-beta-surface-banner";
import { Button } from "@/components/ui/button";
import { requireIntegrationsReadPage } from "@/lib/integrations/integrations-page-access";
import { listMergedPartnerOAuthAppDefinitions } from "@/services/platform/partner-oauth-app-registry-service";
import { listPartnerAppInstallationsForOwner } from "@/services/platform/partner-oauth-service";

export default async function PartnerOAuthAppsPage() {
  const access = await requireIntegrationsReadPage();
  if (!access.ok) return access.deny;

  const { userId } = access.actor;
  const [installations, apps] = await Promise.all([
    listPartnerAppInstallationsForOwner(userId),
    listMergedPartnerOAuthAppDefinitions(),
  ]);

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Integrations · App marketplace Phase 4
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">OAuth apps</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Partner OAuth install flow with workspace consent, scoped access tokens (
            <code className="rounded bg-muted px-1 text-xs">koa_…</code>), embedded admin for
            approved apps, and platform review for partner submissions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/extensions">Extensions catalog</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/outbound-webhooks">Outbound webhooks</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full" data-testid="api-marketplace-link">
            <Link href="/dashboard/developers">API Marketplace</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/developers/apps/register">Submit partner app</Link>
          </Button>
        </div>
      </div>

      <PilotBetaSurfaceBanner
        title="Developer platform — Phase 4–5 BETA"
        status="BETA"
        description="Sandbox + reviewed partner apps. OAuth tokens bypass Enterprise API billing gate when installation is active. Platform accrues partner billing meters on install/revoke (Phase 5) — see /platform/partner-billing."
      />

      <PartnerOAuthAppsPanel
        installations={installations}
        apps={apps}
        canManage={access.canManage}
        origin={origin}
      />
    </div>
  );
}
