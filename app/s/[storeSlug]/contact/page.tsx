import { notFound } from "next/navigation";

import { StorefrontContactForm } from "@/components/storefront/storefront-contact-form";
import { StorefrontFormRenderer } from "@/components/storefront/forms/storefront-form-renderer";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { turnstileSiteKey } from "@/lib/storefront/turnstile";

export default async function StorefrontContactPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  if (!sf) notFound();

  const linked = sf.publicContactForm;
  const useBuilder = linked && linked.active && !linked.archived;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Contact {sf.publicName}</h1>
        <p className="mt-2 text-muted-foreground">
          Questions about menus, pickup, or catering? Send a note — the team reads every message.
        </p>
      </div>
      {useBuilder ? (
        <StorefrontFormRenderer form={linked} storeSlug={storeSlug} />
      ) : (
        <StorefrontContactForm storeSlug={storeSlug} type="CONTACT" turnstileSiteKey={turnstileSiteKey()} />
      )}
    </div>
  );
}
