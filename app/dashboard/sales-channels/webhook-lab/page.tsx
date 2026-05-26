import { WebhookLabForm } from "@/components/sales-channels/webhook-lab-form";

export default function ChannelWebhookLabPage() {
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
