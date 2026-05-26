import Link from "next/link";

import { StorefrontCatalogAdminPanel } from "@/components/dashboard/storefront/storefront-catalog-admin-panel";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { resolveStorefrontAdminAccess } from "@/lib/storefront/storefront-admin-access";
import { prisma } from "@/lib/prisma";
import { getStorefrontCatalogAdminContext } from "@/services/storefront/storefront-catalog-admin-service";

export default async function StorefrontCatalogAdminPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const access = await resolveStorefrontAdminAccess(user.id);
  const ownerUserId = access.ok ? access.storefront.userId : user.id;

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { currency: true },
  });
  const ctx =
    access.ok && access.permissions.includes("storefront.catalog")
      ? await getStorefrontCatalogAdminContext(ownerUserId)
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Catalog options</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Variants, modifiers, and per-product availability — without Prisma Studio. Changes apply to the active menu
            on your live storefront after save.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/storefront/menu">← Menu</Link>
        </Button>
      </div>

      {!access.ok ? (
        <p className="text-muted-foreground">{access.error}</p>
      ) : !access.permissions.includes("storefront.catalog") ? (
        <p className="text-muted-foreground">You do not have catalog edit permission. Ask the storefront owner.</p>
      ) : !ctx ? (
        <p className="text-muted-foreground">Publish your storefront overview first.</p>
      ) : (
        <StorefrontCatalogAdminPanel
          currency={kitchen?.currency ?? "USD"}
          products={ctx.products.map((p) => ({ ...p, price: Number(p.price) }))}
          variants={ctx.variants.map((v) => ({
            ...v,
            priceAdjustment: Number(v.priceAdjustment),
            priceOverride: v.priceOverride != null ? Number(v.priceOverride) : null,
          }))}
          modifierGroups={ctx.modifierGroups.map((g) => ({
            ...g,
            options: g.options.map((o) => ({
              id: o.id,
              name: o.name,
              priceAdjustment: Number(o.priceAdjustment),
            })),
          }))}
          availabilities={ctx.availabilities.map((a) => ({
            productId: a.productId,
            soldOut: a.soldOut,
            maxQuantity: a.maxQuantity,
          }))}
        />
      )}
    </div>
  );
}
