/** PAGE_LAYOUT_EXCEPTION — Command Center aligned with Today brand (DES-27, P1-66). */

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { CommandCenterPanel } from "@/components/command-center/command-center-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  COMMAND_CENTER_BRAND_PAGE_DESC_CLASS,
  COMMAND_CENTER_BRAND_PAGE_SHELL_CLASS,
  COMMAND_CENTER_BRAND_PAGE_TITLE_CLASS,
  COMMAND_CENTER_BRAND_STICKY_HEADER_CLASS,
  COMMAND_CENTER_BRAND_STICKY_HEADER_TEST_ID,
} from "@/lib/design/command-center-brand-policy";
import { canAccessOwnerOnlySurfaces } from "@/lib/platform-admin";
import { safeRequireWorkspacePermissionActor } from "@/lib/permissions/safe-workspace-permission-actor";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCommandCenterSnapshot } from "@/services/command-center/command-center-service";

export const metadata = {
  title: "Command Center",
  description: "Leadership operations view — market, ops, live signals, forecast, and role lanes.",
};

export default async function CommandCenterPage() {
  const [{ dataUserId }, actor] = await Promise.all([
    getTenantActor(),
    safeRequireWorkspacePermissionActor(),
  ]);

  const allowed = await canAccessOwnerOnlySurfaces(
    actor.sessionUserId,
    actor.email,
    actor.workspaceRole,
  );

  if (!allowed) {
    return <PermissionDeniedSurfaceCard surfaceId="command_center" />;
  }

  const snapshot = await loadCommandCenterSnapshot(dataUserId);

  return (
    <div className={COMMAND_CENTER_BRAND_PAGE_SHELL_CLASS}>
      <div
        className={COMMAND_CENTER_BRAND_STICKY_HEADER_CLASS}
        data-testid={COMMAND_CENTER_BRAND_STICKY_HEADER_TEST_ID}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-muted-foreground" aria-hidden />
              <h1 className={COMMAND_CENTER_BRAND_PAGE_TITLE_CLASS}>Command Center</h1>
              <Badge variant="secondary" className="rounded-full">
                Leadership
              </Badge>
            </div>
            <p className={COMMAND_CENTER_BRAND_PAGE_DESC_CLASS}>
              Dense leadership view across market, operations, live signals, forecast, and role
              surfaces — same visual language as Today.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/executive">Executive dashboard</Link>
          </Button>
        </div>
      </div>
      <CommandCenterPanel snapshot={snapshot} />
    </div>
  );
}
