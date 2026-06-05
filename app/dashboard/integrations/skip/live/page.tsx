import Link from "next/link";

import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  ensureSkipConnection,
  getSkipLiveDashboard,
} from "@/services/integrations/skip-live-service";

export const metadata = {
  title: "Skip / Just Eat LIVE — Integrations",
  description: "OAuth, webhooks, and KDS order mapping for Skip and Just Eat.",
};

export default async function SkipLivePage() {
  const { userId } = await getTenantActor();
  await ensureSkipConnection(userId);
  const dashboard = await getSkipLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Skip / Just Eat LIVE"
          detail="Configure SKIP_CLIENT_ID, SKIP_CLIENT_SECRET, SKIP_RESTAURANT_ID, and SKIP_WEBHOOK_SECRET."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Skip / Just Eat LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, signed webhooks → KDS, and status push to Skip / Just Eat API.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/skip">← Setup</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {dashboard.checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={item.done ? "text-emerald-600" : "text-muted-foreground"}>
                {item.done ? "✓" : "○"}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {dashboard.webhookUrl ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhook URL</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block break-all rounded-lg bg-muted px-3 py-2 text-xs">
              {dashboard.webhookUrl}
            </code>
          </CardContent>
        </Card>
      ) : null}

      {dashboard.authorizeUrl ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">OAuth</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <a href={dashboard.authorizeUrl}>Connect Skip / Just Eat</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
