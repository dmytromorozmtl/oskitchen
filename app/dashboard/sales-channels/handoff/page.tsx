import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { parseChannelHandoffJson } from "@/lib/channels/channel-handoff";
import { ChannelHandoffForm } from "@/components/sales-channels/channel-handoff-form";
import { requireSalesChannelsManagePage } from "@/lib/channels/sales-channels-page-access";

export default async function ChannelHandoffPage() {
  const access = await requireSalesChannelsManagePage();
  if (!access.ok) {
    return access.deny;
  }

  const { userId } = await getTenantActor();
  const ks = await prisma.kitchenSettings.findUnique({ where: { userId } });
  const initial = parseChannelHandoffJson(ks?.channelHandoffJson);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Production handoff</h2>
        <p className="text-sm text-muted-foreground">
          Decide when external channel rows should flow into kitchen execution. Defaults are
          conservative — auto production stays off until mapping is trustworthy.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Documentation: <span className="font-mono">docs/PRODUCTION_HANDOFF_RULES.md</span> in the
        repository.
      </p>
      <ChannelHandoffForm initial={initial} />
    </div>
  );
}
