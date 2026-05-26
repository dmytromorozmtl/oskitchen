import { NextResponse } from "next/server";

import {
  assertScopedStorefrontApiAccess,
  isScopedApiError,
} from "@/lib/storefront/storefront-api-scope";
import { prisma } from "@/lib/prisma";
import { parseExperimentDaysParam } from "@/lib/storefront/parse-experiment-days";
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  signAuditExportPayload,
} from "@/lib/audit/signed-export";
import { exportStorefrontExperimentAuditCsv } from "@/services/storefront/storefront-experiment-audit-export";

export async function GET(request: Request) {
  const scoped = await assertScopedStorefrontApiAccess("storefront.settings");
  if (isScopedApiError(scoped)) return scoped;

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: scoped.storefrontId },
    select: { id: true, storeSlug: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "No storefront." }, { status: 404 });
  }

  const url = new URL(request.url);
  const days = parseExperimentDaysParam(url.searchParams.get("days") ?? "90");
  const cappedDays = Math.min(90, days);
  const signed = url.searchParams.get("signed") === "1";

  const { body, rowCount } = await exportStorefrontExperimentAuditCsv({
    storefrontId: sf.id,
    storeSlug: sf.storeSlug,
    days: cappedDays,
  });

  const exportedAt = new Date().toISOString();
  const headers: Record<string, string> = {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="experiment-audit-${sf.storeSlug}-${cappedDays}d.csv"`,
    "X-Row-Count": String(rowCount),
  };

  if (signed) {
    const signature = signAuditExportPayload(body, exportedAt);
    if (!signature) {
      return NextResponse.json(
        { error: "Signed export not configured (AUDIT_EXPORT_HMAC_SECRET)." },
        { status: 503 },
      );
    }
    headers[TIMESTAMP_HEADER] = exportedAt;
    headers[SIGNATURE_HEADER] = signature;
  }

  return new NextResponse(body, { headers });
}
