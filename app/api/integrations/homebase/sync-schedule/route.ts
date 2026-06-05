import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { syncHomebaseScheduleExport } from "@/services/integrations/homebase/schedule-export.service";
import { syncHomebaseScheduleImport } from "@/services/integrations/homebase/schedule-import.service";

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
        ? await syncHomebaseScheduleExport(session.id)
        : await syncHomebaseScheduleImport(session.id, body.staffMappings);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
