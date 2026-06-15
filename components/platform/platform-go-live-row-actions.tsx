import Link from "next/link";

import { startPlatformSupportSessionAction } from "@/actions/platform-support-session";
import { PlatformImpersonationDeepLinkForm } from "@/components/platform/platform-impersonation-deep-link-form";
import {
  resolvePlatformGoLiveRowActions,
  type PlatformGoLiveProjectRow,
} from "@/lib/go-live/platform-go-live-focus-era18";

function actionLinkClass(tone: "urgent" | "normal"): string {
  return tone === "urgent"
    ? "font-medium text-amber-300 underline-offset-2 hover:underline"
    : "text-primary underline-offset-2 hover:underline";
}

export function PlatformGoLiveRowActions(props: {
  row: PlatformGoLiveProjectRow;
  activeSupportWorkspaceId: string | null;
  canImpersonate: boolean;
}) {
  const actions = resolvePlatformGoLiveRowActions(props.row, {
    activeSupportWorkspaceId: props.activeSupportWorkspaceId,
    canImpersonate: props.canImpersonate,
  });

  return (
    <div className="flex flex-col items-start gap-2" data-testid={`platform-go-live-actions-${props.row.id}`}>
      {actions.map((action) => {
        if (action.kind === "tenant_go_live" && action.impersonationTargetUserId) {
          return (
            <PlatformImpersonationDeepLinkForm
              key={action.kind}
              targetUserId={action.impersonationTargetUserId}
              redirectTo={action.href}
              reason={`platform_go_live:${props.row.id}`}
              label={action.label}
              testId={`platform-go-live-tenant-${props.row.id}`}
            />
          );
        }

        if (
          action.kind === "start_support_session" &&
          action.supportSessionWorkspaceId &&
          action.supportSessionRedirectTo
        ) {
          return (
            <form
              key={action.kind}
              action={startPlatformSupportSessionAction}
              className="inline"
              data-testid={`platform-go-live-support-${props.row.id}`}
            >
              <input type="hidden" name="workspaceId" value={action.supportSessionWorkspaceId} />
              <input type="hidden" name="mode" value="READ_ONLY" />
              <input type="hidden" name="ttlHours" value="2" />
              <input type="hidden" name="reason" value={`Go-live support: ${props.row.id}`} />
              <input type="hidden" name="redirectTo" value={action.supportSessionRedirectTo} />
              <button type="submit" className={`text-xs ${actionLinkClass(action.tone)}`}>
                {action.label}
              </button>
            </form>
          );
        }

        return (
          <Link
            key={action.kind}
            href={action.href}
            data-testid={`platform-go-live-next-${props.row.id}`}
            className={`text-xs ${actionLinkClass(action.tone)}`}
          >
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
