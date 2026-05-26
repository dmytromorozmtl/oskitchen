import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { buildErrorCsv, getImportJob } from "@/services/import-center/import-center-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const user = await requireSessionUser();
  const detail = await getImportJob(user.id, jobId);
  if (!detail) return NextResponse.json({ error: "Import job not found" }, { status: 404 });

  const csv = buildErrorCsv(detail.rows);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${detail.job.filename}.errors.csv"`,
    },
  });
}
