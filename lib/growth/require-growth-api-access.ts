import { NextResponse } from "next/server";

import { authorizeGrowth } from "@/lib/growth/require-growth-access";
import type { GrowthCapability } from "@/lib/growth/growth-types";

/** Gate growth export/API routes on canonical growth permissions (+ legacy GTM bridge). */
export async function requireGrowthApiAccess(
  capability: GrowthCapability = "growth.view",
): Promise<NextResponse | null> {
  const access = await authorizeGrowth(capability);
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
