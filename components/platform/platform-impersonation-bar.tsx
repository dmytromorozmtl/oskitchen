import Link from "next/link";

import { endPlatformImpersonation } from "@/actions/platform-impersonation";
import { Button } from "@/components/ui/button";
import {
  formatImpersonationTtl,
  getActiveImpersonationSession,
} from "@/lib/platform/impersonation-session";

export async function PlatformImpersonationBar() {
  const session = await getActiveImpersonationSession();
  if (!session) return null;

  return (
    <div
      role="alert"
      className="border-b border-amber-500/40 bg-amber-950/90 px-4 py-2 text-center text-sm text-amber-50"
    >
      <span className="font-medium">Impersonation active</span>
      <span className="mx-2 text-amber-200/90">
        — viewing as {session.targetEmail ?? session.targetUserId} · TTL{" "}
        {formatImpersonationTtl(session.secondsRemaining)}
      </span>
      <form action={endPlatformImpersonation} className="inline">
        <Button type="submit" size="sm" variant="secondary" className="ml-2 h-7 rounded-full">
          End session
        </Button>
      </form>
      <Link href={`/platform/preview/${session.targetUserId}`} className="ml-3 text-xs underline">
        Preview hub
      </Link>
    </div>
  );
}
