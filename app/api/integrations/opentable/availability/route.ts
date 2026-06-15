import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { syncOpenTableAvailability } from "@/services/integrations/opentable/table-availability.service";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const partySize = Number(url.searchParams.get("partySize") ?? "2");

  try {
    const result = await syncOpenTableAvailability(session.id, {
      partySize: Number.isFinite(partySize) ? partySize : 2,
      push: false,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { partySize?: number };
  const partySize = Number(body.partySize ?? 2);

  try {
    const result = await syncOpenTableAvailability(session.id, {
      partySize: Number.isFinite(partySize) ? partySize : 2,
      push: true,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
