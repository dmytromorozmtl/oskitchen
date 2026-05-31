import Link from "next/link";
import { headers } from "next/headers";

import { PartnerOAuthAppsPanel } from "@/components/dashboard/oauth/partner-oauth-apps-panel";
import { PilotBetaSurfaceBanner } from "@/components/dashboard/pilot-beta-surface-banner";
import { Button } from "@/components/ui/button";
import { requireIntegrationsReadPage } from "@/lib/integrations/integrations-page-access";
import { listPartnerOAuthAppDefinitions } from "@/lib/oauth/partner-oauth-app-catalog";
import { listPartnerAppInstallationsForOwner } from "@/services/platform/partner-oauth-service";

export default async function PartnerOAuthAppsPage() {
  const access = await requireIntegrationsReadPage();
  if (!access.ok) return access.deny;

  const { userId } = access.actor;
  const [installations, apps] = await Promise.all([
    listPartnerAppInstallationsForOwner(userId),
    Promise.resolve(listPartnerOAuthAppDefinitions()),
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
            Integrations · App marketplace Phase 3
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">OAuth apps</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Sandbox partner OAuth install flow with workspace consent, scoped access tokens (
            <code className="rounded bg-muted px-1 text-xs">koa_…</code>), and revocation. Tokens map to
            enterprise API scopes — not a full public app store yet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/extensions">Extensions catalog</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/outbound-webhooks">Outbound webhooks</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/developers/webhooks">Developer docs</Link>
          </Button>
        </div>
      </div>

      <PilotBetaSurfaceBanner
        title="Developer platform — Phase 3 BETA"
        status="BETA"
        description="Sandbox apps only. OAuth tokens bypass Enterprise API billing gate when installation is active — rate limits and scope enforcement still apply. No embedded admin (Phase 4)."
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
