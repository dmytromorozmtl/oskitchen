import { endPlatformImpersonation } from "@/actions/platform-impersonation";
import { Button } from "@/components/ui/button";
import {
  formatImpersonationTtl,
  getActiveImpersonationSession,
} from "@/lib/platform/impersonation-session";

/** Shown on tenant dashboard when a platform admin has an active impersonation cookie. */
export async function PlatformImpersonationNotice() {
  let session = null;
  try {
    session = await getActiveImpersonationSession();
  } catch (error) {
    console.error("[impersonation] notice render failed", error);
    return null;
  }
  if (!session) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-50"
    >
      <p className="font-medium">Platform support view</p>
      <p className="mt-1 text-amber-900/80 dark:text-amber-100/80">
        Impersonation context for {session.targetEmail ?? session.targetUserId} · expires in{" "}
        {formatImpersonationTtl(session.secondsRemaining)}
      </p>
      <form action={endPlatformImpersonation} className="mt-2">
        <Button type="submit" size="sm" variant="outline" className="rounded-full">
          End impersonation
        </Button>
      </form>
    </div>
  );
}
