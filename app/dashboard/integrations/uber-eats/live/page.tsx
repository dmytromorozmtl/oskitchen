import Link from "next/link";
import { Suspense } from "react";

import { UberEatsLivePanel } from "@/components/integrations/uber-eats-live-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  ensureUberEatsConnection,
  getUberEatsLiveDashboard,
} from "@/services/integrations/uber-eats-live-service";

export const metadata = {
  title: "Uber Eats LIVE — Integrations",
  description: "OAuth, webhooks, menu sync, and order mapping for Uber Eats Marketplace.",
};

export default async function UberEatsLivePage() {
  const { userId } = await getTenantActor();
  await ensureUberEatsConnection(userId);
  const dashboard = await getUberEatsLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Uber Eats LIVE"
          detail="Configure UBER_EATS_CLIENT_ID, UBER_EATS_CLIENT_SECRET, and UBER_EATS_STORE_ID — then connect OAuth on this page."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Uber Eats LIVE</h1>
            <BetaBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth connection, signed webhooks, menu push, and canonical order mapping into OS Kitchen.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/uber-eats">← Settings</Link>
        </Button>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading live controls…</p>}>
        <UberEatsLivePanel dashboard={dashboard} />
      </Suspense>
    </div>
  );
}
