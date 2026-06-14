import Link from "next/link";

import { BumpRecallAuditPanel } from "@/components/kitchen/bump-recall-audit-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { BUMP_RECALL_AUDIT_POLICY_ID } from "@/lib/kitchen/bump-recall-audit-p2-91-policy";
import { loadBumpRecallAuditSnapshot } from "@/services/kitchen/bump-recall-audit-p2-91-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-91 — bump/recall audit hub. */
export default function BumpRecallAuditPage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <BumpRecallAuditPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function BumpRecallAuditPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const snapshot = await loadBumpRecallAuditSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bump / recall audit</h1>
          <p className="text-sm text-muted-foreground">
            Operator accountability — policy {BUMP_RECALL_AUDIT_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen">Open KDS</Link>
        </Button>
      </div>
      <BumpRecallAuditPanel snapshot={snapshot} />
    </div>
  );
}
