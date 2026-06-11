import Link from "next/link";

import { KlaviyoSyncPanel } from "@/components/integrations/klaviyo-sync-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isKlaviyoSyncConfigured } from "@/services/integrations/klaviyo-sync-service";
import { listEmailCampaignFlows } from "@/services/marketing/email-marketing-service";

export const dynamic = "force-dynamic";

export default async function KlaviyoIntegrationPage() {
  const configured = isKlaviyoSyncConfigured();
  const flows = await listEmailCampaignFlows();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">Klaviyo</h1>
          <LiveBadge title="LIVE — API key, campaign triggers, segment export" />
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/klaviyo/live">Open LIVE dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {configured ? (
            <p className="text-emerald-600">KLAVIYO_API_KEY detected</p>
          ) : (
            <p className="text-muted-foreground">Set KLAVIYO_API_KEY for profile sync and event triggers</p>
          )}
          <KlaviyoSyncPanel configured={configured} />
          <Link href="/dashboard/marketing/email-campaigns" className="text-xs text-primary underline">
            Email campaigns →
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event flows</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {flows.map((flow) => (
              <li key={flow.id} className="flex items-center justify-between gap-2">
                <span>{flow.label}</span>
                <span className={flow.configured ? "text-emerald-600" : "text-muted-foreground"}>
                  {flow.configured ? "Ready" : "Needs API key"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
