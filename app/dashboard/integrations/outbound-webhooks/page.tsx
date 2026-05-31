import Link from "next/link";

import { OutboundWebhooksPanel } from "@/components/dashboard/webhooks/outbound-webhooks-panel";
import { PilotBetaSurfaceBanner } from "@/components/dashboard/pilot-beta-surface-banner";
import { Button } from "@/components/ui/button";
import { requireIntegrationsReadPage } from "@/lib/integrations/integrations-page-access";
import {
  listOutboundWebhookEventDefinitions,
  outboundWebhookHeaders,
} from "@/lib/webhooks/outbound-webhook-events";
import {
  listRecentOutboundWebhookDeliveries,
} from "@/services/webhooks/outbound-webhook-delivery-service";
import { listOutboundWebhookSubscriptionsForOwner } from "@/services/webhooks/outbound-webhook-subscription-service";

export default async function OutboundWebhooksPage() {
  const access = await requireIntegrationsReadPage();
  if (!access.ok) {
    return access.deny;
  }

  const { userId } = access.actor;
  const [subscriptions, deliveries] = await Promise.all([
    listOutboundWebhookSubscriptionsForOwner(userId),
    listRecentOutboundWebhookDeliveries(userId),
  ]);
  const events = listOutboundWebhookEventDefinitions();
  const headers = outboundWebhookHeaders();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Integrations · App marketplace Phase 2
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Outbound webhooks</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Merchant-configured event subscriptions for certified partners and internal automations.
            Signed with {headers.signature} + {headers.timestamp}; retries via cron worker. OAuth app
            install remains Phase 3.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/extensions">Extensions catalog</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/sales-channels/webhooks">Inbound webhooks</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/developers/webhooks">Developer docs</Link>
          </Button>
        </div>
      </div>

      <PilotBetaSurfaceBanner
        title="Outbound webhooks — Phase 2 BETA"
        status="BETA"
        description="Enterprise-grade signing and retries ship here; OAuth marketplace and embedded admin remain roadmap. Do not claim full Toast/Square marketplace parity in sales copy."
      />

      <OutboundWebhooksPanel
        subscriptions={subscriptions}
        deliveries={deliveries}
        events={events}
        canManage={access.canManage}
      />
    </div>
  );
}
