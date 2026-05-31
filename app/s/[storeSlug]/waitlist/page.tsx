import { notFound } from "next/navigation";

import { PublicWaitlistWidget } from "@/components/storefront/public-waitlist-widget";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";

export default async function StorefrontWaitlistPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  if (!sf) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Waitlist</h1>
        <p className="mt-2 text-muted-foreground">
          Join the line at {sf.publicName}. Estimated wait updates as parties are seated.
        </p>
      </div>
      <PublicWaitlistWidget storeSlug={storeSlug} storeName={sf.publicName} />
    </div>
  );
}
