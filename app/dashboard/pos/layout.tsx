import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { PosSubnav } from "@/components/dashboard/pos-subnav";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { buildPosSubnavLinks } from "@/lib/pos/pos-subnav-links";
import { canUseFeature } from "@/lib/plans/feature-registry";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireWorkspacePermissionActor();
  const gate = await canUseFeature(actor.userId, "pos_terminal");
  if (!gate.allowed) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10">
        <PosAccessCard
          title="POS Terminal"
          description="Counter sales, registers, and shift-aware cash tracking are available on Pro plans and above (or while trialing with billing access)."
          primaryHref="/dashboard/billing"
          primaryLabel="Review billing"
          secondaryHref="/dashboard/today"
          secondaryLabel="Back to Today"
        />
      </div>
    );
  }

  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_layout" />;
  }

  const links = buildPosSubnavLinks(actor.granted);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PosSubnav links={links} />
      {children}
    </div>
  );
}
