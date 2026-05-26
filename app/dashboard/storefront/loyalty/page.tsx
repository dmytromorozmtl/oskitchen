import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { getOrCreateLoyaltyProgram } from "@/services/storefront/loyalty-service";

export default async function StorefrontLoyaltyPage() {
  const { sessionUser: user } = await getTenantActor();
  const sf = await findAdminStorefront(user.id, { id: true });
  const program = sf ? await getOrCreateLoyaltyProgram(sf.id, user.id) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Loyalty</h1>
        <p className="mt-2 text-muted-foreground">
          Points per dollar, redeem blocks, and guest balance via{" "}
          <code className="text-xs">/api/storefront/loyalty/balance</code>.
        </p>
      </div>

      {!program ? (
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Set up storefront</Link>
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Program settings</CardTitle>
            <CardDescription>Guests redeem at checkout using email on file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Earn: <strong>{Number(program.pointsPerDollar)}</strong> pts / $1
            </p>
            <p>
              Redeem: <strong>{program.redeemPoints}</strong> pts → ${Number(program.redeemAmount)}
            </p>
            <p>
              Minimum redeem: <strong>{program.minPointsToRedeem}</strong> pts
            </p>
            <p>Status: {program.isActive ? "Active" : "Paused"}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
