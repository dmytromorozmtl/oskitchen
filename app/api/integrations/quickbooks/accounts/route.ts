import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { fetchQuickBooksChartOfAccounts } from "@/services/integrations/quickbooks/chart-of-accounts.service";

export async function GET() {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chart = await fetchQuickBooksChartOfAccounts(session.id);
    return NextResponse.json({ ok: true, ...chart });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message: msg }, { status: 400 });
  }
}
