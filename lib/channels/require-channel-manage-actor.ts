import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { requireChannelActor, type ChannelActor } from "@/lib/channels/require-channel-actor";

export async function requireChannelManageActor(input?: {
  operation?: string;
  metadata?: Record<string, unknown>;
}): Promise<
  | (ChannelActor & { ok: true })
  | { ok: false; error: string }
> {
  const access = await requireIntegrationsActor({
    operation: input?.operation ?? "channel.manage",
    metadata: input?.metadata,
  });
  if (!access.ok) {
    return { ok: false, error: access.error };
  }
  const channel = await requireChannelActor();
  return { ok: true, ...channel };
}
