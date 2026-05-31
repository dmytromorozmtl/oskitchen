import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";

export default async function StorefrontAboutPage({
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
        <h1 className="text-3xl font-semibold tracking-tight">About {sf.publicName}</h1>
        {sf.tagline ? <p className="mt-2 text-lg text-muted-foreground">{sf.tagline}</p> : null}
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {sf.description ? (
          <p className="whitespace-pre-wrap text-muted-foreground">{sf.description}</p>
        ) : (
          <p className="text-muted-foreground">
            This kitchen uses OS Kitchen to power weekly preorders. Story content can be added from
            the storefront Pages tab in your admin.
          </p>
        )}
      </div>
      <Button asChild className="rounded-full">
        <Link href={`/s/${storeSlug}/menu`}>View this week&apos;s menu</Link>
      </Button>
    </div>
  );
}
