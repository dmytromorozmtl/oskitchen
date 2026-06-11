import { requireSalesChannelsManagePage } from "@/lib/channels/sales-channels-page-access";

export default async function ChannelAssistantPage() {
  const access = await requireSalesChannelsManagePage();
  if (!access.ok) {
    return access.deny;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Channel onboarding assistant</h2>
        <p className="text-sm text-muted-foreground">
          Deterministic guidance — no AI key required. Answer the checklist with your operator, then
          follow the priority list.
        </p>
      </div>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Turn on OS Kitchen storefront or manual orders first — always-on baselines.</li>
        <li>Add WooCommerce or Shopify only when encryption (<span className="font-mono">ENCRYPTION_KEY</span>) is configured.</li>
        <li>Run a sandbox order, confirm webhook + staging batch, then approve in import staging.</li>
        <li>Map SKUs before enabling any auto-production handoff toggles.</li>
        <li>Keep super-admin diagnostics on workspace.moroz@gmail.com for break-glass review.</li>
      </ol>
      <p className="text-xs text-muted-foreground">
        Deep references: <span className="font-mono">docs/CHANNEL_ONBOARDING_ASSISTANT.md</span>
      </p>
    </div>
  );
}
