import Link from "next/link";
import { notFound } from "next/navigation";

import { StorefrontGiftCardsClient } from "@/components/storefront/storefront-gift-cards-client";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";

export default async function StorefrontGiftCardsPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  if (!sf) notFound();

  return (
    <div className="storefront-content space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Gift cards</h1>
        <p className="mt-2 text-muted-foreground">
          Check your balance or learn how to get a gift card from {sf.publicName}.
        </p>
      </div>
      <StorefrontGiftCardsClient storeSlug={storeSlug} publicName={sf.publicName} />
      <p className="text-sm text-muted-foreground">
        <Link href={`/s/${storeSlug}/menu`} className="text-[var(--store-accent,hsl(var(--primary)))] underline-offset-4 hover:underline">
          ← Back to menu
        </Link>
      </p>
    </div>
  );
}
