import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { PermissionDeniedShell } from "@/components/dashboard/permission-denied-shell";
import {
  resolvePermissionDeniedSurface,
  type PermissionDeniedSurfaceId,
} from "@/lib/ux/permission-denied-copy";

type PermissionDeniedSurfaceCardProps = {
  surfaceId: PermissionDeniedSurfaceId;
};

/** Standard RBAC denial card for POS / KDS pilot surfaces. */
export function PermissionDeniedSurfaceCard({ surfaceId }: PermissionDeniedSurfaceCardProps) {
  const surface = resolvePermissionDeniedSurface(surfaceId);
  return (
    <PermissionDeniedShell surface={surfaceId}>
      <PosAccessCard
        title={surface.title}
        description={surface.description}
        primaryHref={surface.primaryHref}
        primaryLabel={surface.primaryLabel}
        secondaryHref={surface.secondaryHref}
        secondaryLabel={surface.secondaryLabel}
        permissionKey={surface.permissionKey}
      />
    </PermissionDeniedShell>
  );
}
