import { WebhookLabForm } from "@/components/sales-channels/webhook-lab-form";
import { requireSalesChannelsManagePage } from "@/lib/channels/sales-channels-page-access";

export default async function ChannelWebhookLabPage() {
  const access = await requireSalesChannelsManagePage();
  if (!access.ok) {
    return access.deny;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Webhook test lab</h2>
        <p className="text-sm text-muted-foreground">
          Store signed-off JSON fixtures as processed webhook events for diagnostics. This does not
          open inbound tunnels — paste payloads you already captured from partner admins.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Production endpoints remain on <span className="font-mono">/api/webhooks/*</span> — unchanged.
      </p>
      <WebhookLabForm />
    </div>
  );
}
