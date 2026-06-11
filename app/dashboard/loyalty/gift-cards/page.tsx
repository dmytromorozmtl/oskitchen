import Link from "next/link";

import { GiftCardsHub } from "@/components/loyalty/gift-cards-hub";
import { PolicyLockedHonestyBanner } from "@/components/dashboard/policy-locked-honesty-banner";
import { Button } from "@/components/ui/button";
import {
  requireGiftCardsPageAccess,
  requireLoyaltyPageAccess,
} from "@/lib/crm/rewards-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  getGiftCardHubSummary,
  listEnrichedGiftCards,
} from "@/services/loyalty/gift-cards-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gift cards",
  description: "Digital and physical gift cards — loyalty hub.",
};

export default async function LoyaltyGiftCardsPage() {
  const [loyaltyAccess, giftAccess] = await Promise.all([
    requireLoyaltyPageAccess(),
    requireGiftCardsPageAccess(),
  ]);
  if (!loyaltyAccess.ok && !giftAccess.ok) return loyaltyAccess.deny;
  const canManage = giftAccess.ok && giftAccess.canManage;

  const { userId } = await getTenantActor();
  const [summary, cards] = await Promise.all([
    getGiftCardHubSummary(userId),
    listEnrichedGiftCards(userId),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Gift cards system</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Issue digital cards by email or print physical batches — redeem at POS on the kitchen
            ledger.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/dashboard/loyalty/program-builder">Loyalty 2.0</Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/dashboard/gift-cards">Classic gift cards</Link>
          </Button>
        </div>
      </div>

      <PolicyLockedHonestyBanner variant="rewards_dual_ledger" />

      <GiftCardsHub summary={summary} cards={cards} canManage={canManage} />
    </div>
  );
}
