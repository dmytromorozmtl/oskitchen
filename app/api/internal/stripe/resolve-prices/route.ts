import { NextResponse } from "next/server";

import { requireSuperAdminActor } from "@/lib/auth/is-superadmin";
import { resolvePlanPriceIdAsync } from "@/lib/billing/stripe-price-resolver";

/**
 * Superadmin-only: resolve live `price_…` ids from OS Kitchen Stripe products.
 * Use output to set NEXT_PUBLIC_STRIPE_*_PRICE_ID in Vercel, then redeploy.
 */
export async function GET() {
  try {
    await requireSuperAdminActor();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [starter, pro, team] = await Promise.all([
    resolvePlanPriceIdAsync("STARTER"),
    resolvePlanPriceIdAsync("PRO"),
    resolvePlanPriceIdAsync("TEAM"),
  ]);

  return NextResponse.json({
    NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID: starter,
    NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: pro,
    NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID: team,
    vercelCommands: [
      starter && `echo "${starter}" | vercel env add NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID production`,
      pro && `echo "${pro}" | vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production`,
      team && `echo "${team}" | vercel env add NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID production`,
    ].filter(Boolean),
  });
}
