import Link from "next/link";

import { issueGiftCardFormAction } from "@/actions/storefront/gift-cards";
import { asVoidFormAction } from "@/lib/actions/server-form-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireStorefrontGiftCardsPageAccess } from "@/lib/storefront/storefront-rewards-page-access";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { listGiftCardsForStorefront } from "@/services/storefront/gift-card-service";

export default async function StorefrontGiftCardsPage() {
  const pageAccess = await requireStorefrontGiftCardsPageAccess();
  if (!pageAccess.ok) return pageAccess.deny;

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: pageAccess.access.storefront.id },
    select: { id: true, currency: true },
  });
  const cards = sf ? await listGiftCardsForStorefront(sf.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Gift cards</h1>
        <p className="mt-2 text-muted-foreground">
          Issue codes with partial redemption — remaining balance stays on the card until depleted.
        </p>
      </div>

      {!sf ? (
        <Card>
          <CardContent className="py-6">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Set up storefront first</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Issue card</CardTitle>
              <CardDescription>Bulk corporate issuance: repeat this form or use the API.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={asVoidFormAction(issueGiftCardFormAction)} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ({sf.currency})</Label>
                  <Input id="amount" name="amount" type="number" min={1} step="0.01" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient email</Label>
                  <Input id="recipientEmail" name="recipientEmail" type="email" className="rounded-xl" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="recipientName">Recipient name</Label>
                  <Input id="recipientName" name="recipientName" className="rounded-xl" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Button type="submit" className="rounded-full">
                    Generate code
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active cards</CardTitle>
            </CardHeader>
            <CardContent>
              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No gift cards yet.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {cards.map((c) => (
                    <li key={c.id} className="flex justify-between py-3 font-mono">
                      <span>{c.code}</span>
                      <span>
                        {formatCurrency(Number(c.balance), sf.currency)} / {formatCurrency(Number(c.initialValue), sf.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
