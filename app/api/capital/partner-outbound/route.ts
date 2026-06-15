import { NextResponse } from "next/server";

import { recordAuditLog } from "@/lib/audit-log";
import { getCapitalPartnerBySlug } from "@/lib/commercial/capital-partners";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

export async function GET(request: Request) {
  const access = await requireMutationPermission("reports.read.financial");
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing partner slug." }, { status: 400 });
  }

  const partner = getCapitalPartnerBySlug(slug);
  if (!partner || partner.internal) {
    return NextResponse.json({ error: "Partner not found." }, { status: 404 });
  }

  if (!partner.href.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid partner destination." }, { status: 400 });
  }

  const actor = await requireTenantActor();
  await recordAuditLog({
    userId: actor.sessionUser.id,
    workspaceId: actor.workspaceId ?? null,
    action: "capital.partner_outbound",
    entityType: "CapitalPartner",
    entityId: partner.slug,
    metadata: {
      partnerName: partner.name,
      href: partner.href,
      category: partner.category,
      referralFee: partner.referralFee,
    },
  });

  return NextResponse.redirect(partner.href, 302);
}
