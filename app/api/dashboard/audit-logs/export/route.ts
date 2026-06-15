import { NextResponse } from "next/server";

import { resolveAuditWorkspaceScope } from "@/lib/audit/audit-center-scope";
import { parseAuditExportSearchParams } from "@/lib/audit/audit-export-filters";
import { requireAuditExportAccess } from "@/lib/audit/require-audit-center-mutation-access";
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  signAuditExportPayload,
} from "@/lib/audit/signed-export";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { exportAuditLogsSync } from "@/services/audit/audit-export-service";

export async function GET(request: Request) {
  const exportAccess = await requireAuditExportAccess();
  if (!exportAccess.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scope = await resolveAuditWorkspaceScope();
  if (!scope) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const filters = parseAuditExportSearchParams(url.searchParams);
  const formatParam = url.searchParams.get("format")?.toLowerCase() ?? "csv";
  const format = formatParam === "json" ? "JSON" : "CSV";
  const signed = url.searchParams.get("signed") === "1";

  const wsId =
    filters.workspaceId && scope.ownedWorkspaceIds.includes(filters.workspaceId)
      ? filters.workspaceId
      : scope.ownedWorkspaceIds[0];
  if (!wsId) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }

  const { sessionUser: user } = await requireTenantActor();
  const out = await exportAuditLogsSync({
    scope,
    workspaceId: wsId,
    filters,
    format,
    requestedById: user.id,
  });

  if (!out.ok) {
    const status = out.error === "no_workspace" ? 404 : 400;
    return NextResponse.json({ error: out.error }, { status });
  }

  const exportedAt = new Date().toISOString();
  const headers: Record<string, string> = {
    "Content-Type":
      format === "CSV" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
    "Content-Disposition": `attachment; filename="${out.filename}"`,
    "X-Row-Count": String(out.rowCount),
  };

  if (signed) {
    const signature = signAuditExportPayload(out.body, exportedAt);
    if (!signature) {
      return NextResponse.json(
        { error: "Signed export not configured (AUDIT_EXPORT_HMAC_SECRET)." },
        { status: 503 },
      );
    }
    headers[TIMESTAMP_HEADER] = exportedAt;
    headers[SIGNATURE_HEADER] = signature;
  }

  return new NextResponse(out.body, { headers });
}
