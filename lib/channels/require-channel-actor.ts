import { requireUserProfile } from "@/lib/auth";
import { requireTenantActor, type TenantActor } from "@/lib/scope/require-tenant-actor";

export type ChannelActor = TenantActor & {
  profile: Awaited<ReturnType<typeof requireUserProfile>>;
};

/** Session + workspace data owner + profile (channel command center). */
export async function requireChannelActor(): Promise<ChannelActor> {
  const tenant = await requireTenantActor();
  const profile = await requireUserProfile();
  return { ...tenant, profile };
}
