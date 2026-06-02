import Link from "next/link";
import { Suspense } from "react";

import { DoorDashLivePanel } from "@/components/integrations/doordash-live-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  ensureDoorDashConnection,
  getDoorDashLiveDashboard,
} from "@/services/integrations/doordash-live-service";

export const metadata = {
  title: "DoorDash LIVE — Integrations",
  description: "OAuth, webhooks, menu sync, and order mapping for DoorDash Marketplace.",
};

export default async function DoorDashLivePage() {
  const { userId } = await getTenantActor();
  await ensureDoorDashConnection(userId);
  const dashboard = await getDoorDashLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="DoorDash LIVE"
          detail="Configure DOORDASH_API_KEY, DOORDASH_MERCHANT_ID, and DOORDASH_WEBHOOK_SECRET — or save credentials on this page."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">DoorDash LIVE</h1>
            <BetaBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, signed webhooks, menu push, and canonical order mapping into OS Kitchen.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/doordash">← BETA settings</Link>
        </Button>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading live controls…</p>}>
        <DoorDashLivePanel dashboard={dashboard} />
      </Suspense>
    </div>
  );
}
