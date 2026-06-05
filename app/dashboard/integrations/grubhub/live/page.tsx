import Link from "next/link";
import { Suspense } from "react";

import { GrubhubLivePanel } from "@/components/integrations/grubhub-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  ensureGrubhubConnection,
  getGrubhubLiveDashboard,
} from "@/services/integrations/grubhub-live-service";

export const metadata = {
  title: "Grubhub LIVE — Integrations",
  description: "OAuth, webhooks, menu sync, and order mapping for Grubhub Marketplace.",
};

export default async function GrubhubLivePage() {
  const { userId } = await getTenantActor();
  await ensureGrubhubConnection(userId);
  const dashboard = await getGrubhubLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Grubhub LIVE"
          detail="Configure GRUBHUB_API_KEY, GRUBHUB_MERCHANT_ID, and GRUBHUB_WEBHOOK_SECRET — or save credentials on this page."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Grubhub LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, signed webhooks, menu push, and canonical order mapping into OS Kitchen.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/grubhub">← Integration settings</Link>
        </Button>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading live controls…</p>}>
        <GrubhubLivePanel dashboard={dashboard} />
      </Suspense>
    </div>
  );
}
