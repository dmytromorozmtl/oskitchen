import { NextResponse } from "next/server";

import {
  inviteAuditRowsToCsv,
  type InviteAuditExportRow,
} from "@/lib/storefront/invite-audit-export";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_EXPORT_ROWS = 10_000;

export async function GET() {
  const { sf } = await requireAdminStorefrontRow("storefront.team", {
    id: true,
    storeSlug: true,
    workspaceId: true,
  });

  if (!sf.workspaceId) {
    return NextResponse.json({ error: "Workspace required for audit export." }, { status: 400 });
  }

  const events = await prisma.storefrontTeamInviteEvent.findMany({
    where: { storefrontId: sf.id },
    orderBy: { createdAt: "desc" },
    take: MAX_EXPORT_ROWS,
    include: {
      actor: { select: { email: true, fullName: true } },
      invite: { select: { email: true, role: true } },
    },
  });

  const rows: InviteAuditExportRow[] = events.map((ev) => ({
    id: ev.id,
    createdAt: ev.createdAt,
    eventType: ev.eventType,
    targetEmail: ev.targetEmail,
    inviteEmail: ev.invite?.email ?? null,
    inviteRole: ev.invite?.role ?? null,
    actorEmail: ev.actor?.email ?? null,
    actorName: ev.actor?.fullName ?? null,
    metadataJson: ev.metadataJson,
  }));

  const csv = inviteAuditRowsToCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `storefront-invite-audit-${sf.storeSlug}-${stamp}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
