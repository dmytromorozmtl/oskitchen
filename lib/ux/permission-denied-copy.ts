/**
 * Standard permission-denied copy — Evolution Era 17 Workstream H Cycle 33.
 */

import type { PermissionKey } from "@/lib/permissions/permissions";

export type PermissionDeniedSurfaceId =
  | "pos_terminal"
  | "pos_hub"
  | "pos_layout"
  | "kds"
  | "packing_command"
  | "packing_verify"
  | "production_calendar"
  | "production_board";

export type PermissionDeniedSurfaceDef = {
  id: PermissionDeniedSurfaceId;
  title: string;
  permissionKey: PermissionKey;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export const PERMISSION_DENIED_SURFACES: Record<
  PermissionDeniedSurfaceId,
  PermissionDeniedSurfaceDef
> = {
  pos_terminal: {
    id: "pos_terminal",
    title: "POS terminal",
    permissionKey: "pos.access",
    primaryHref: "/dashboard/pos",
    primaryLabel: "Back to POS hub",
  },
  pos_hub: {
    id: "pos_hub",
    title: "POS workspace",
    permissionKey: "pos.access",
    primaryHref: "/dashboard",
    primaryLabel: "Back to dashboard",
  },
  pos_layout: {
    id: "pos_layout",
    title: "POS workspace",
    permissionKey: "pos.access",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  },
  kds: {
    id: "kds",
    title: "Kitchen display",
    permissionKey: "kitchen.view",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  },
  packing_command: {
    id: "packing_command",
    title: "Packing command center",
    permissionKey: "packing.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/kitchen",
    secondaryLabel: "Open kitchen",
  },
  packing_verify: {
    id: "packing_verify",
    title: "Packing verification",
    permissionKey: "packing.manage",
    primaryHref: "/dashboard/packing",
    primaryLabel: "Back to packing",
    secondaryHref: "/dashboard/today",
    secondaryLabel: "Back to Today",
  },
  production_calendar: {
    id: "production_calendar",
    title: "Production calendar",
    permissionKey: "production.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/production",
    secondaryLabel: "Open production board",
  },
  production_board: {
    id: "production_board",
    title: "Production board",
    permissionKey: "production.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/production/calendar",
    secondaryLabel: "Open calendar",
  },
};

export function buildPermissionDeniedDescription(permissionKey: PermissionKey): string {
  return `You do not have permission for this workspace surface (${permissionKey}). Ask a workspace owner to update your role.`;
}

export function resolvePermissionDeniedSurface(
  surfaceId: PermissionDeniedSurfaceId,
): PermissionDeniedSurfaceDef & { description: string } {
  const surface = PERMISSION_DENIED_SURFACES[surfaceId];
  return {
    ...surface,
    description: buildPermissionDeniedDescription(surface.permissionKey),
  };
}
