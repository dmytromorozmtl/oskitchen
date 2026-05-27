import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isExportType } from "@/lib/import-export/export-types";
import { requireExportActor } from "@/lib/import-export/require-export-actor";
import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";
import { createStreamingCsvExport, streamExportMeta } from "@/lib/import-export/streaming-csv-export";
import { buildExportCsv, recordExportJob } from "@/services/import-export/export-service";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get("type");
  if (!kind || !isExportType(kind)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const isPlatformSuperAdmin = await hasSuperAdminRoleRow(user.id);
  if (kind === "audit_logs" && !isPlatformSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const access = await requireExportActor({ exportType: kind, operation: `export:${kind}` });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const dataUserId = access.actor.dataUserId;

  const streamMeta = streamExportMeta(kind);
  if (streamMeta) {
    const stream = createStreamingCsvExport(dataUserId, kind);
    if (stream) {
      await recordExportJob(user.id, user.id, kind, streamMeta.filename, -1).catch(() => {});
      return new NextResponse(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${streamMeta.filename}"`,
          "Transfer-Encoding": "chunked",
        },
      });
    }
  }

  let filename: string;
  let body: string;
  let rowCount: number;
  try {
    const built = await buildExportCsv(dataUserId, kind, {
      isSuperAdmin: kind === "audit_logs" && isPlatformSuperAdmin,
    });
    filename = built.filename;
    body = built.body;
    rowCount = built.rowCount;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "AUDIT_EXPORT_FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw e;
  }
  await recordExportJob(user.id, user.id, kind, filename, rowCount).catch(() => {
    /* export CSV still succeeds if audit row fails */
  });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
