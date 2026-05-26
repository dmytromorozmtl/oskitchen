import Link from "next/link";
import { cookies } from "next/headers";

import { endPlatformSupportSessionAction } from "@/actions/platform-support-session";
import { Button } from "@/components/ui/button";
import { SUPPORT_SESSION_COOKIE } from "@/lib/platform/support-session-types";
import { requirePlatformAccess } from "@/lib/platform/platform-guards";
import { getActiveSupportSessionForActor } from "@/services/platform/platform-support-session-service";

export async function SupportSessionPlatformBanner() {
  const ctx = await requirePlatformAccess();
  const jar = await cookies();
  const id = jar.get(SUPPORT_SESSION_COOKIE)?.value;
  if (!id) return null;
  const session = await getActiveSupportSessionForActor(ctx.userId, id);
  if (!session) return null;

  return (
    <div className="border-b border-sky-500/40 bg-sky-950/90 px-4 py-2 text-center text-sm text-sky-50">
      <span className="font-medium">Support session (read-only)</span>
      <span className="mx-2 text-sky-200/90">
        Workspace {session.workspace.name} · expires {session.expiresAt.toISOString().slice(0, 16)} UTC
      </span>
      <form action={endPlatformSupportSessionAction} className="inline">
        <Button type="submit" size="sm" variant="secondary" className="ml-2 h-7 rounded-full">
          End session
        </Button>
      </form>
      <Link href={`/platform/workspaces/${session.workspace.id}/integration-health`} className="ml-3 text-xs underline">
        Integration health
      </Link>
    </div>
  );
}
