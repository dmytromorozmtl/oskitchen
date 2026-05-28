import Link from "next/link";
import { cookies } from "next/headers";

import { PlatformGoLiveAttentionStrip } from "@/components/platform/platform-go-live-attention-strip";
import { PlatformGoLiveProjectsPanel } from "@/components/platform/platform-go-live-projects-panel";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { SUPPORT_SESSION_COOKIE } from "@/lib/platform/support-session-types";
import { loadPlatformGoLiveCommandCenterModel } from "@/services/platform/platform-go-live-service";
import { getActiveSupportSessionForActor } from "@/services/platform/platform-support-session-service";

export default async function PlatformGoLivePage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:workspaces:read");

  const model = await loadPlatformGoLiveCommandCenterModel();
  const me = await getSessionUser();
  const canImpersonate = me ? await isSuperAdminUser(me.id, me.email) : false;

  const jar = await cookies();
  const supportSessionId = jar.get(SUPPORT_SESSION_COOKIE)?.value;
  const supportSession = supportSessionId
    ? await getActiveSupportSessionForActor(ctx.userId, supportSessionId)
    : null;
  const activeSupportWorkspaceId = supportSession?.workspace.id ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Go-live</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Cross-tenant launch calendar and readiness queue for platform ops. Pair with paid pilot
            evidence on Implementations — this view never claims GO/NO-GO PASS for a tenant.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full border-zinc-700">
            <Link href="/platform/implementations">Pilot GO/NO-GO evidence</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full border-zinc-700">
            <Link href="/platform/workspaces">All workspaces</Link>
          </Button>
        </div>
      </div>

      <PlatformGoLiveAttentionStrip model={model} />

      <PlatformGoLiveProjectsPanel
        model={model}
        activeSupportWorkspaceId={activeSupportWorkspaceId}
        canImpersonate={canImpersonate}
      />
    </div>
  );
}
