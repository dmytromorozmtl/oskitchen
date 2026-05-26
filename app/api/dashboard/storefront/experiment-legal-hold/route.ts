import { NextResponse } from "next/server";

import {
  assertScopedStorefrontApiAccess,
  isScopedApiError,
} from "@/lib/storefront/storefront-api-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** POST { enabled: boolean } — legal hold on experiment audit archives. */
export async function POST(request: Request) {
  const scoped = await assertScopedStorefrontApiAccess("storefront.settings");
  if (isScopedApiError(scoped)) return scoped;
  if (!scoped.isOwner) {
    return NextResponse.json({ error: "Owner only" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { enabled?: boolean } | null;
  const enabled = body?.enabled === true;

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: scoped.storefrontId },
    select: { id: true, storeSlug: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { experimentLegalHoldAt: enabled ? new Date() : null },
  });

  const { auditLog } = await import("@/services/audit/audit-service");
  await auditLog({
    actor: { userId: scoped.userId, email: null },
    action: enabled ? "storefront.experiment.legal_hold.set" : "storefront.experiment.legal_hold.clear",
    category: "SETTINGS",
    source: "USER",
    entity: { type: "storefront_settings", id: sf.id, label: sf.storeSlug },
    metadata: { storeSlug: sf.storeSlug, enabled },
  });

  return NextResponse.json({ ok: true, enabled });
}
