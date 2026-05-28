import Link from "next/link";
import { cookies } from "next/headers";

import { endPlatformSupportSessionAction } from "@/actions/platform-support-session";
import { Button } from "@/components/ui/button";
import { buildPlatformSupportSessionBannerGoLiveModel } from "@/lib/go-live/platform-support-session-banner-go-live-era18";
import { SUPPORT_SESSION_COOKIE } from "@/lib/platform/support-session-types";
import { requirePlatformAccess } from "@/lib/platform/platform-guards";
import { loadPlatformWorkspaceGoLiveProjects } from "@/services/platform/platform-go-live-service";
import { getActiveSupportSessionForActor } from "@/services/platform/platform-support-session-service";

function bannerLinkClass(tone: "urgent" | "normal"): string {
  return tone === "urgent"
    ? "ml-3 text-xs font-medium text-amber-200 underline underline-offset-2"
    : "ml-3 text-xs underline underline-offset-2";
}

export async function SupportSessionPlatformBanner() {
  const ctx = await requirePlatformAccess();
  const jar = await cookies();
  const id = jar.get(SUPPORT_SESSION_COOKIE)?.value;
  if (!id) return null;
  const session = await getActiveSupportSessionForActor(ctx.userId, id);
  if (!session) return null;

  const projects = await loadPlatformWorkspaceGoLiveProjects(session.workspace.id);
  const goLive = buildPlatformSupportSessionBannerGoLiveModel({
    workspaceId: session.workspace.id,
    projects,
  });

  return (
    <div
      className="border-b border-sky-500/40 bg-sky-950/90 px-4 py-2 text-center text-sm text-sky-50"
      data-testid="platform-support-session-banner"
    >
      <span className="font-medium">Support session (read-only)</span>
      <span className="mx-2 text-sky-200/90">
        Workspace {session.workspace.name} · expires {session.expiresAt.toISOString().slice(0, 16)} UTC
      </span>
      <form action={endPlatformSupportSessionAction} className="inline">
        <Button type="submit" size="sm" variant="secondary" className="ml-2 h-7 rounded-full">
          End session
        </Button>
      </form>
      <Link
        href={`/platform/workspaces/${session.workspace.id}`}
        className="ml-3 text-xs underline underline-offset-2"
        data-testid="platform-support-session-banner-workspace"
      >
        Workspace
      </Link>
      <Link
        href={goLive.sectionLink.href}
        className={bannerLinkClass(goLive.sectionLink.tone)}
        data-testid="platform-support-session-banner-go-live"
      >
        {goLive.sectionLink.label}
      </Link>
      {goLive.urgentProjectLink ? (
        <Link
          href={goLive.urgentProjectLink.href}
          className={bannerLinkClass("urgent")}
          data-testid="platform-support-session-banner-go-live-urgent"
        >
          {goLive.urgentProjectLink.label}
        </Link>
      ) : null}
      <Link
        href={`/platform/workspaces/${session.workspace.id}/integration-health`}
        className="ml-3 text-xs underline underline-offset-2"
        data-testid="platform-support-session-banner-integration-health"
      >
        Integration health
      </Link>
    </div>
  );
}
