import Link from "next/link";

import { ExtensionsCatalogPanel } from "@/components/dashboard/extensions/extensions-catalog-panel";
import { PilotBetaSurfaceBanner } from "@/components/dashboard/pilot-beta-surface-banner";
import { Button } from "@/components/ui/button";
import { requireIntegrationsReadPage } from "@/lib/integrations/integrations-page-access";
import { getExtensionsCatalogForOwner } from "@/services/platform/extensions-catalog-service";

export default async function IntegrationsExtensionsPage() {
  const access = await requireIntegrationsReadPage();
  if (!access.ok) {
    return access.deny;
  }

  const { userId } = access.actor;
  const { items, summary } = await getExtensionsCatalogForOwner(userId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Integrations
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Extensions catalog</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Curated partner directory and first-party connectors — Phase 1 of the app marketplace
            program. This is not a self-serve OAuth app store yet; certified SI partners handle
            implementation while OS Kitchen ships honest BETA/LIVE integration paths.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/sales-channels">Sales channels</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/partners">Partner program</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/outbound-webhooks">Outbound webhooks</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/oauth-apps">OAuth apps</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/developers">Developer roadmap</Link>
          </Button>
        </div>
      </div>

      <PilotBetaSurfaceBanner
        title="Partner directory — Phase 1–4"
        status="BETA"
        description="Certified SI partners, OAuth sandbox apps, outbound webhooks, and embedded admin for reviewed apps. Not a self-serve Toast/Square marketplace — partner submissions require platform review."
      />

      {!access.canManage ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          Read-only access — browse the catalog and partner options; connecting integrations requires
          integration management permission.
        </p>
      ) : null}

      <ExtensionsCatalogPanel items={items} summary={summary} canManage={access.canManage} />
    </div>
  );
}
