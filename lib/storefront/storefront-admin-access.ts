import { z } from "zod";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readAdminStorefrontCookie } from "@/lib/storefront/storefront-admin-cookie";
import { workspacePermissionForStorefrontAdminPermission } from "@/lib/storefront/storefront-admin-permission-keys";
import { requireCanonicalStorefrontPermission } from "@/lib/storefront/require-storefront-actor";
import { resolveOwnerStorefront } from "@/lib/storefront/resolve-owner-storefront";

export const STOREFRONT_ADMIN_PERMISSIONS = [
  "storefront.settings",
  "storefront.catalog",
  "storefront.markets",
  "storefront.theme",
  "storefront.orders",
  "storefront.team",
] as const;

export type StorefrontAdminPermission = (typeof STOREFRONT_ADMIN_PERMISSIONS)[number];

const staffAccessSchema = z.object({
  allowWorkspaceStaff: z.boolean().optional().default(false),
  staffPermissions: z.array(z.enum(STOREFRONT_ADMIN_PERMISSIONS)).optional().default([]),
  adminPermissions: z
    .array(z.enum(STOREFRONT_ADMIN_PERMISSIONS))
    .optional()
    .default([...STOREFRONT_ADMIN_PERMISSIONS]),
});

export type StorefrontStaffAccessConfig = z.infer<typeof staffAccessSchema>;

export function parseStorefrontStaffAccess(settingsCenterJson: unknown): StorefrontStaffAccessConfig {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") {
    return staffAccessSchema.parse({});
  }
  const sf = (settingsCenterJson as Record<string, unknown>).storefront;
  if (!sf || typeof sf !== "object") return staffAccessSchema.parse({});
  const raw = (sf as Record<string, unknown>).staffAccess;
  const parsed = staffAccessSchema.safeParse(raw);
  return parsed.success ? parsed.data : staffAccessSchema.parse({});
}

export type StorefrontAdminAccess = {
  ok: true;
  /** Session user owns the storefront record (`storefront.userId`), not workspace RBAC owner. */
  isOwner: boolean;
  workspaceRole: "OWNER" | "ADMIN" | "STAFF" | "PARTNER" | null;
  permissions: StorefrontAdminPermission[];
  storefront: { id: string; storeSlug: string; userId: string; workspaceId: string | null };
};

function pickStorefrontFromList<T extends { id: string; storeSlug: string; userId: string; workspaceId: string | null }>(
  rows: T[],
  preferredId: string | null,
): T | null {
  if (rows.length === 0) return null;
  if (preferredId) {
    const match = rows.find((r) => r.id === preferredId);
    if (match) return match;
  }
  return rows[0] ?? null;
}

export async function resolveStorefrontAdminAccess(
  userId: string,
): Promise<StorefrontAdminAccess | { ok: false; error: string }> {
  const preferredId = await readAdminStorefrontCookie();

  const owned = await resolveOwnerStorefront(userId, preferredId);
  if (owned) {
    return {
      ok: true,
      isOwner: true,
      workspaceRole: "OWNER",
      permissions: [...STOREFRONT_ADMIN_PERMISSIONS],
      storefront: {
        id: owned.id,
        storeSlug: owned.storeSlug,
        userId: owned.userId,
        workspaceId: owned.workspaceId,
      },
    };
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: {
        include: {
          storefronts: { orderBy: { updatedAt: "desc" } },
        },
      },
    },
  });

  const wsStorefronts = membership?.workspace.storefronts ?? [];
  const wsStorefront = pickStorefrontFromList(
    wsStorefronts.map((s) => ({
      id: s.id,
      storeSlug: s.storeSlug,
      userId: s.userId,
      workspaceId: s.workspaceId,
    })),
    preferredId,
  );

  if (!membership || !wsStorefront) {
    return { ok: false, error: "No storefront access." };
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: wsStorefront.userId },
    select: { settingsCenterJson: true },
  });
  const staffAccess = parseStorefrontStaffAccess(kitchen?.settingsCenterJson);

  if (!staffAccess.allowWorkspaceStaff) {
    return { ok: false, error: "Workspace staff cannot access this storefront yet." };
  }

  const role = membership.role;
  let permissions: StorefrontAdminPermission[] = [];

  if (role === "OWNER" || role === "ADMIN" || role === "PARTNER") {
    permissions = staffAccess.adminPermissions;
  } else {
    permissions = staffAccess.staffPermissions;
  }

  if (permissions.length === 0) {
    return { ok: false, error: "No storefront permissions assigned." };
  }

  return {
    ok: true,
    isOwner: false,
    workspaceRole: role,
    permissions,
    storefront: {
      id: wsStorefront.id,
      storeSlug: wsStorefront.storeSlug,
      userId: wsStorefront.userId,
      workspaceId: wsStorefront.workspaceId,
    },
  };
}

export async function requireStorefrontAdminPermissionForUser(
  userId: string,
  permission: StorefrontAdminPermission,
): Promise<StorefrontAdminAccess> {
  const required = workspacePermissionForStorefrontAdminPermission(permission);
  await requireCanonicalStorefrontPermission(required, {
    operation: `storefront.admin.${permission}`,
    metadata: { adminPermission: permission },
  });

  const access = await resolveStorefrontAdminAccess(userId);
  if (!access.ok) {
    throw new Error(access.error);
  }
  if (!access.permissions.includes(permission)) {
    throw new Error("You do not have permission for this action.");
  }
  return access;
}

export async function requireStorefrontAdminPermission(
  permission: StorefrontAdminPermission,
): Promise<StorefrontAdminAccess> {
  const user = await requireSessionUser();
  return requireStorefrontAdminPermissionForUser(user.id, permission);
}
