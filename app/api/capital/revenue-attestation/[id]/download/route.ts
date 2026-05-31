import { NextResponse } from "next/server";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  loadRevenueAttestationExportForOwner,
  revenueAttestationToDownloadJson,
} from "@/services/commercial/revenue-attestation-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const access = await requireMutationPermission("reports.export");
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const { id } = await context.params;
  const actor = await requireTenantActor();
  const origin = new URL(_request.url).origin;

  try {
    const document = await loadRevenueAttestationExportForOwner({
      userId: actor.dataUserId,
      attestationId: id,
      verifyBaseUrl: origin,
    });
    if (!document) {
      return NextResponse.json({ error: "Attestation not found." }, { status: 404 });
    }

    const filename = `kitchenos-revenue-attestation-${document.payload.periodStart}-${document.payload.periodEnd}.json`;
    return new NextResponse(revenueAttestationToDownloadJson(document), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
