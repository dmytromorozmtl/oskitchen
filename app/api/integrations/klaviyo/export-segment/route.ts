import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  exportKlaviyoSegmentProfiles,
  listKlaviyoSegmentsForExport,
} from "@/services/integrations/klaviyo/segment-export.service";
import { updateKlaviyoLiveSettings } from "@/services/integrations/klaviyo/klaviyo-live-service";

export async function GET() {
  const result = await listKlaviyoSegmentsForExport();
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, segments: result.segments });
}

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    segmentId?: string;
    limit?: number;
  };

  if (!body.segmentId?.trim()) {
    return NextResponse.json({ ok: false, message: "segmentId is required." }, { status: 400 });
  }

  const result = await exportKlaviyoSegmentProfiles(body.segmentId.trim(), {
    limit: body.limit,
  });

  if (result.ok) {
    await updateKlaviyoLiveSettings(dataUserId, {
      lastSegmentExportAt: new Date().toISOString(),
      lastSegmentExportId: body.segmentId.trim(),
      lastSegmentExportCount: result.rowCount,
    });
  }

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return new NextResponse(result.csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "X-Export-Row-Count": String(result.rowCount),
    },
  });
}
