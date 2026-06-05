import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { syncSevenShiftsScheduleExport } from "@/services/integrations/seven-shifts/schedule-export.service";
import { syncSevenShiftsScheduleImport } from "@/services/integrations/seven-shifts/schedule-import.service";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    direction?: string;
    staffMappings?: Record<string, string>;
  };

  try {
    const result =
      body.direction === "export"
        ? await syncSevenShiftsScheduleExport(session.id)
        : await syncSevenShiftsScheduleImport(session.id, body.staffMappings);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
