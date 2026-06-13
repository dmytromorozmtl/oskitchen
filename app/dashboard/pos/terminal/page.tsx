import { Suspense } from "react";

import { PosTerminalAsyncSection } from "@/components/dashboard/pos/pos-terminal-async-section";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { POSSkeleton } from "@/components/dashboard/pos-skeleton";
import { buildManagerDiscountAuditFlowProofSlice } from "@/lib/commercial/era20-manager-discount-audit-flow-proof-era20";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { resolveOperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import { resolvePosCashierSpeedMode } from "@/lib/pos/pos-cashier-speed-mode-era19";

export const metadata = {
  title: "POS Terminal — Desktop",
  description: "Professional desktop POS with keyboard shortcuts and multi-monitor customer display.",
};

/** PAGE_LAYOUT_EXCEPTION — full-screen POS terminal chrome (DES-27). */

export default async function PosTerminalPage({
  searchParams,
}: {
  searchParams?: Promise<{ speed?: string; welcome?: string }>;
}) {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_terminal" />;
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const persona = resolveOperatorHomePersona({
    workspaceRole: actor.workspaceRole,
    granted: actor.granted,
    staffRoleType: actor.staffRoleType,
    platformBypass: actor.platformBypass,
  });
  const speedMode = resolvePosCashierSpeedMode({
    speedParam: resolvedSearchParams.speed,
    persona,
  });
  const showWelcome = resolvedSearchParams.welcome === "true";

  const managerAuditFlowProof = buildManagerDiscountAuditFlowProofSlice({
    viewerCanApplyDiscount: hasPermission(actor.granted, "pos.discount.apply"),
  });

  return (
    <div className="space-y-4 xl:-mx-4 xl:max-w-none">
      <Suspense fallback={<POSSkeleton section="register" />}>
        <PosTerminalAsyncSection
          actor={actor}
          speedMode={speedMode}
          showWelcome={showWelcome}
          managerAuditFlowProof={managerAuditFlowProof}
        />
      </Suspense>
    </div>
  );
}
