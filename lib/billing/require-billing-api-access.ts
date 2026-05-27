import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api/with-api-guard";
import type { BillingCapability } from "@/lib/billing/billing-permissions";
import { requireBillingActor } from "@/lib/billing/require-billing-actor";

export async function requireBillingApiAccess(cap: BillingCapability): Promise<
  | { ok: true; userId: string; email: string | null }
  | { ok: false; response: NextResponse }
> {
  const session = await requireApiSession();
  if (!session.ok) {
    return { ok: false, response: session.response };
  }

  const gate = await requireBillingActor(cap, { operation: `api.billing.${cap}` });
  if (!gate.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: gate.error, code: "forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    userId: gate.userId,
    email: session.context.email,
  };
}
