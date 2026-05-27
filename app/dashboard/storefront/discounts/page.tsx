import Link from "next/link";

import {
  createStorefrontDiscountFormAction,
  deleteStorefrontDiscountFormAction,
  toggleStorefrontDiscountFormAction,
} from "@/actions/storefront-discounts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function StorefrontDiscountsPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: pageAccess.access.storefront.id },
    select: {
      id: true,
      currency: true,
      discounts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!sf) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Discounts</h1>
        <p className="text-sm text-muted-foreground">Save the storefront overview first.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Overview</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Promo codes</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Codes are validated on checkout server-side. Usage increments after a successful pay-later order, or after
          Stripe confirms payment for online checkout.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Create code</CardTitle>
          <CardDescription>Percentage, fixed amount, or free delivery.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createStorefrontDiscountFormAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" required className="rounded-xl font-mono uppercase" placeholder="SPRING10" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kind">Type</Label>
              <select id="kind" name="kind" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option value="PERCENT_OFF">Percent off</option>
                <option value="FIXED_OFF">Fixed amount off</option>
                <option value="FREE_DELIVERY">Free delivery</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentOff">Percent (1–100)</Label>
              <Input id="percentOff" name="percentOff" type="number" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountOff">Amount off ({sf.currency})</Label>
              <Input id="amountOff" name="amountOff" type="number" step="0.01" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max uses (optional)</Label>
              <Input id="maxUses" name="maxUses" type="number" min={1} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires (date, optional)</Label>
              <Input id="expiresAt" name="expiresAt" type="date" className="rounded-xl" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-full">
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Active codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {sf.discounts.length === 0 ? (
            <p className="text-muted-foreground">No codes yet.</p>
          ) : (
            <ul className="divide-y divide-border/80 rounded-xl border border-border/80">
              {sf.discounts.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-mono font-semibold">{d.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.kind === "PERCENT_OFF" && d.percentOff != null
                        ? `${d.percentOff}% off`
                        : d.kind === "FIXED_OFF" && d.amountOff != null
                          ? `${formatCurrency(Number(d.amountOff), sf.currency)} off`
                          : "Free delivery"}{" "}
                      · uses {d.usesCount}
                      {d.maxUses != null ? ` / ${d.maxUses}` : ""}
                      {d.expiresAt ? ` · expires ${d.expiresAt.toISOString().slice(0, 10)}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={toggleStorefrontDiscountFormAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <Button type="submit" variant="outline" size="sm" className="rounded-full">
                        {d.active ? "Disable" : "Enable"}
                      </Button>
                    </form>
                    <form action={deleteStorefrontDiscountFormAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <Button type="submit" variant="destructive" size="sm" className="rounded-full">
                        Delete
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
