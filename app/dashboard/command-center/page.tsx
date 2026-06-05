/** PAGE_LAYOUT_EXCEPTION — Bloomberg-style terminal chrome (DES-27). */

import Link from "next/link";

import { CommandCenterPanel } from "@/components/command-center/command-center-panel";
import { rolePageActionClass } from "@/lib/design/dark-mode-everywhere-patterns";
import { Button } from "@/components/ui/button";
import { canAccessOwnerOnlySurfaces } from "@/lib/platform-admin";
import { safeRequireWorkspacePermissionActor } from "@/lib/permissions/safe-workspace-permission-actor";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCommandCenterSnapshot } from "@/services/command-center/command-center-service";

export const metadata = {
  title: "Command Center",
  description: "Bloomberg-style operations terminal — market, ops, live, forecast, and role lanes.",
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
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-400">
        Owner or leadership access required for the Command Center terminal.
      </div>
    );
  }

  const snapshot = await loadCommandCenterSnapshot(dataUserId);

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-600">
            Command Center
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Operations Terminal
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Dense Bloomberg-style view across market, operations, live signals, forecast, and role
            surfaces — one screen for leadership.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className={rolePageActionClass}>
          <Link href="/dashboard/executive">Executive dashboard</Link>
        </Button>
      </div>
      <CommandCenterPanel snapshot={snapshot} />
    </div>
  );
}
