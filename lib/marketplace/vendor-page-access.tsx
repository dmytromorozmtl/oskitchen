import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { logMarketplacePermissionDenied } from "@/services/marketplace/marketplace-permission-audit";

export type VendorCabinetAccess = {
  actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
  vendorId: string;
  vendorName: string;
  canAccess: boolean;
  canManageProducts: boolean;
};

export async function resolveVendorCabinetAccess(): Promise<
  | (VendorCabinetAccess & { ok: true })
  | { ok: false; deny: ReactNode; reason: "permission" | "vendor" }
> {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return {
      ok: false,
      reason: "vendor",
      deny: createElement(PosAccessCard, {
        title: "Vendor cabinet",
        description: "Open a workspace to access the marketplace vendor cabinet.",
        primaryHref: "/dashboard/today",
        primaryLabel: "Back to Today",
      }),
    };
  }

  const hasCabinetPermission =
    hasPermission(actor.granted, "vendor:cabinet:access") ||
    (actor.workspaceRole === "OWNER" && hasPermission(actor.granted, "marketplace:read"));

  if (!hasCabinetPermission) {
    await logMarketplacePermissionDenied(actor, {
      requiredPermission: "vendor:cabinet:access",
      operation: "vendor.cabinet.access",
    });
    return {
      ok: false,
      reason: "permission",
      deny: createElement(PosAccessCard, {
        title: "Vendor cabinet",
        description: "You do not have permission to access the marketplace vendor cabinet.",
        primaryHref: "/dashboard/marketplace",
        primaryLabel: "Marketplace",
      }),
    };
  }

  const vendor = await prisma.vendor.findFirst({
    where: { workspaceId: actor.workspaceId, status: "APPROVED" },
    select: { id: true, companyName: true },
  });

  if (!vendor) {
    return {
      ok: false,
      reason: "vendor",
      deny: createElement(PosAccessCard, {
        title: "Vendor not verified",
        description: "Complete vendor registration and wait for platform approval to open the vendor cabinet.",
        primaryHref: "/vendor/register/status",
        primaryLabel: "Verification status",
        secondaryHref: "/vendor/register",
        secondaryLabel: "Register",
      }),
    };
  }

  return {
    ok: true,
    actor,
    vendorId: vendor.id,
    vendorName: vendor.companyName,
    canAccess: true,
    canManageProducts:
      hasPermission(actor.granted, "vendor:products:manage") ||
      (actor.workspaceRole === "OWNER" && hasPermission(actor.granted, "marketplace:read")),
  };
}

export async function requireVendorCabinetPage(input?: {
  operation?: string;
  route?: string;
}): Promise<
  | ({ ok: true } & VendorCabinetAccess)
  | { ok: false; deny: ReactNode }
> {
  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false, deny: access.deny };
  return access;
}
