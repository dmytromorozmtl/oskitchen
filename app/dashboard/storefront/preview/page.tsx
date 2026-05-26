import Link from "next/link";

import { StorefrontPreviewFrame } from "@/components/dashboard/storefront-preview-frame";
import { SITE_URL } from "@/lib/constants";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { prisma } from "@/lib/prisma";
import { isStorefrontPreviewTokenConfigured } from "@/lib/storefront/preview-token";
import { Button } from "@/components/ui/button";

export default async function StorefrontPreviewPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sf = await findAdminStorefront(user.id);
  if (!sf) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Preview</h1>
        <p className="text-sm text-muted-foreground">Save storefront settings on Overview first.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Open overview</Link>
        </Button>
      </div>
    );
  }
  const url = `${SITE_URL}/s/${sf.storeSlug}`;
  const previewCookieAvailable = isStorefrontPreviewTokenConfigured();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Preview</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          While signed in you can always open your draft storefront. For embedded preview without relying on the admin
          session, KitchenOS can mint a short-lived signed cookie (same origin) so the iframe can load unpublished
          stores safely.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <Link href={url} target="_blank" rel="noreferrer">
            Open public URL
          </Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/dashboard/storefront/theme">Theme</Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/dashboard/storefront/pages">Pages</Link>
        </Button>
      </div>
      <StorefrontPreviewFrame storeSlug={sf.storeSlug} previewCookieAvailable={previewCookieAvailable} />
    </div>
  );
}
