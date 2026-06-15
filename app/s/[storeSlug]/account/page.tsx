import Link from "next/link";
import { notFound } from "next/navigation";

import { StorefrontAccountAuthPanel } from "@/components/storefront/storefront-account-auth-panel";
import { StorefrontAccountClient } from "@/components/storefront/storefront-account-client";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { turnstileSiteKey } from "@/lib/storefront/turnstile";

export default async function StorefrontAccountPage({
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
        <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>
        <p className="mt-2 text-muted-foreground">
          Look up preorders placed with {sf.publicName} using the email from checkout.
        </p>
      </div>
      <StorefrontAccountAuthPanel storeSlug={storeSlug} />
      <details className="rounded-2xl border border-border/80 bg-muted/20 p-4">
        <summary className="cursor-pointer text-sm font-medium">Guest lookup (no sign-in)</summary>
        <div className="mt-4">
          <StorefrontAccountClient storeSlug={storeSlug} turnstileSiteKey={turnstileSiteKey()} />
        </div>
      </details>
      <p className="text-sm text-muted-foreground">
        <Link href={`/s/${storeSlug}/menu`} className="text-primary underline-offset-4 hover:underline">
          ← Back to menu
        </Link>
      </p>
    </div>
  );
}
