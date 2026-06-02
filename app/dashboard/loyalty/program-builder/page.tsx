import Link from "next/link";

import { LoyaltyProgramBuilder } from "@/components/loyalty/loyalty-program-builder";
import { PolicyLockedHonestyBanner } from "@/components/dashboard/policy-locked-honesty-banner";
import { Button } from "@/components/ui/button";
import { requireLoyaltyPageAccess } from "@/lib/crm/rewards-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { productListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadLoyalty2Program } from "@/services/loyalty/loyalty-2.0-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Loyalty program builder",
  description: "Loyalty 2.0 — points per item, visits, birthdays, referrals, tiers.",
};

export default async function LoyaltyProgramBuilderPage() {
  const access = await requireLoyaltyPageAccess();
  if (!access.ok) return access.deny;

  const { userId } = await getTenantActor();
  const program = await loadLoyalty2Program(userId);

  const products = await prisma.product.findMany({
    where: await productListWhereForOwner(userId),
    select: { id: true, title: true, price: true },
    orderBy: { title: "asc" },
    take: 40,
  });

  const sampleProducts = products.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
  }));

  return (
    <div className="space-y-4">
      <PolicyLockedHonestyBanner variant="rewards_dual_ledger" />
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link href="/dashboard/customers/loyalty">Classic loyalty settings</Link>
        </Button>
      </div>
      {access.canManage ? (
        <LoyaltyProgramBuilder program={program} sampleProducts={sampleProducts} />
      ) : (
        <p className="text-sm text-muted-foreground">
          You can view the program builder but need loyalty.manage to save rules.
        </p>
      )}
    </div>
  );
}
