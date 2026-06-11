import { GiftCardIssueForm } from "@/components/gift-cards/gift-card-issue-form";
import { GiftCardList } from "@/components/gift-cards/gift-card-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireGiftCardsPageAccess } from "@/lib/crm/rewards-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listGiftCards } from "@/services/gift-cards/gift-card-service";

export const dynamic = "force-dynamic";

export default async function GiftCardsPage() {
  const access = await requireGiftCardsPageAccess();
  if (!access.ok) return access.deny;

  const { dataUserId } = await getTenantActor();
  const cards = await listGiftCards(dataUserId);

  const rows = cards.map((c) => ({
    id: c.id,
    code: c.code,
    balance: Number(c.balance),
    initialBalance: Number(c.initialBalance),
    status: c.status,
    updatedAt: c.updatedAt,
  }));

  const usage = rows.filter((c) => c.status === "PARTIALLY_REDEEMED" || c.status === "REDEEMED");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gift cards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Issue cards and redeem at POS — partial redemption keeps remaining balance.
        </p>
      </div>

      {access.canManage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issue gift card</CardTitle>
          </CardHeader>
          <CardContent>
            <GiftCardIssueForm />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active cards</CardTitle>
        </CardHeader>
        <CardContent>
          <GiftCardList cards={rows.filter((c) => c.status === "ACTIVE" || c.status === "PARTIALLY_REDEEMED")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage history</CardTitle>
        </CardHeader>
        <CardContent>
          {usage.length === 0 ? (
            <p className="text-sm text-muted-foreground">No redemptions recorded yet.</p>
          ) : (
            <GiftCardList cards={usage} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
