import { notFound } from "next/navigation";

import { StorefrontContactForm } from "@/components/storefront/storefront-contact-form";
import { StorefrontFormRenderer } from "@/components/storefront/forms/storefront-form-renderer";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { turnstileSiteKey } from "@/lib/storefront/turnstile";

export default async function StorefrontCateringPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  if (!sf) notFound();

  const linked = sf.publicCateringForm;
  const useBuilder = linked && linked.active && !linked.archived;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Catering inquiries</h1>
        <p className="mt-2 text-muted-foreground">
          Share event details — {sf.publicName} will follow up with availability and a tailored quote.
        </p>
      </div>
      {useBuilder ? (
        <StorefrontFormRenderer form={linked} storeSlug={storeSlug} />
      ) : (
        <StorefrontContactForm storeSlug={storeSlug} type="CATERING" turnstileSiteKey={turnstileSiteKey()} />
      )}
    </div>
  );
}
