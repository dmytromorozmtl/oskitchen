import Link from "next/link";
import { notFound } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";

export default async function StorefrontTermsPolicyPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  if (!sf) notFound();

  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-3xl font-semibold tracking-tight">Terms</h1>
      {sf.termsText?.trim() ? (
        <p className="whitespace-pre-wrap text-muted-foreground">{sf.termsText.trim()}</p>
      ) : (
        <p className="text-muted-foreground">
          Checkout terms are configured in KitchenOS when the kitchen enables the legal checkbox on
          checkout. If you have questions,{" "}
          <Link href={`/s/${storeSlug}/contact`} className="text-primary underline-offset-4 hover:underline">
            contact the kitchen
          </Link>
          .
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        <Link href={`/s/${storeSlug}`} className="text-primary underline-offset-4 hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
