import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  resolveStorefrontAdminAccess,
  type StorefrontAdminPermission,
} from "@/lib/storefront/storefront-admin-access";

export type ScopedStorefrontApiContext = {
  userId: string;
  storefrontId: string;
  storeSlug: string;
  isOwner: boolean;
  permissions: StorefrontAdminPermission[];
};

/**
 * Scoped dashboard API guard — ties requests to the active admin storefront (cookie)
 * and permission set (owner / workspace staff).
 */
export async function assertScopedStorefrontApiAccess(
  permission: StorefrontAdminPermission,
  opts?: { storefrontId?: string | null },
): Promise<ScopedStorefrontApiContext | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const access = await resolveStorefrontAdminAccess(user.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  if (opts?.storefrontId && opts.storefrontId !== access.storefront.id) {
    const owned = await prisma.storefrontSettings.findFirst({
      where: { id: opts.storefrontId, userId: user.id },
      select: { id: true },
    });
    const member = !owned
      ? await prisma.workspaceMember.findFirst({
          where: { userId: user.id, workspace: { storefronts: { some: { id: opts.storefrontId } } } },
        })
      : null;
    if (!owned && !member) {
      return NextResponse.json({ error: "Storefront not in scope." }, { status: 403 });
    }
  }

  if (!access.permissions.includes(permission)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return {
    userId: user.id,
    storefrontId: access.storefront.id,
    storeSlug: access.storefront.storeSlug,
    isOwner: access.isOwner,
    permissions: access.permissions,
  };
}

export function isScopedApiError(
  result: ScopedStorefrontApiContext | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
