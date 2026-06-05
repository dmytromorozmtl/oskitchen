import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { syncResyWaitlist } from "@/services/integrations/resy/waitlist-sync.service";

export async function POST() {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncResyWaitlist(session.id);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
