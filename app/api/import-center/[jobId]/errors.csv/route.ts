import { NextResponse } from "next/server";

import { requireImportCenterApiAccess } from "@/lib/import-center/require-import-center-api";
import { buildErrorCsv, getImportJob } from "@/services/import-center/import-center-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const access = await requireImportCenterApiAccess({
    capability: "import.view",
    operation: "import_center.api.errors_csv",
  });
  if (!access.ok) return access.response;

  const { jobId } = await params;
  const detail = await getImportJob(access.actor.userId, jobId);
  if (!detail) return NextResponse.json({ error: "Import job not found" }, { status: 404 });

  const csv = buildErrorCsv(detail.rows);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${detail.job.filename}.errors.csv"`,
    },
  });
}
