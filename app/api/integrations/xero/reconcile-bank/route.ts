import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { reconcileXeroBankTransactions } from "@/services/integrations/xero/bank-reconciliation.service";

export async function POST() {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await reconcileXeroBankTransactions(session.id);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
