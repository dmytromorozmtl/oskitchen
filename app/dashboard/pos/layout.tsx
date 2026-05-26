import Link from "next/link";

import { PosSubnav } from "@/components/dashboard/pos-subnav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { canUseFeature } from "@/lib/plans/feature-registry";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const { dataUserId } = await getTenantActor();
  const gate = await canUseFeature(dataUserId, "pos_terminal");
  if (!gate.allowed) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>POS Terminal</CardTitle>
            <CardDescription>
              Counter sales, registers, and shift-aware cash tracking are available on Pro plans and above (or while
              trialing with billing access).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="premium" className="rounded-full">
              <Link href="/dashboard/billing">Review billing</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/today">Back to Today</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PosSubnav />
      {children}
    </div>
  );
}
