import { notFound } from "next/navigation";

import { StorefrontContactForm } from "@/components/storefront/storefront-contact-form";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";

export default async function StorefrontFaqPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  if (!sf) notFound();

  const items = [
    {
      q: "How does preorder work?",
      a: "Choose items from the weekly menu, pick pickup or delivery if offered, then submit a request. The kitchen confirms timing and payment directly with you when pay-later mode is on.",
    },
    {
      q: "When is the menu updated?",
      a: "Menus rotate on the schedule your kitchen sets in KitchenOS. If you do not see new items yet, check back closer to the prep week.",
    },
    {
      q: "Do I pay online here?",
      a: sf.payLaterOnly
        ? "This storefront is in request / pay-later mode — you will arrange payment with the kitchen unless they enable online payments."
        : "Payment options depend on how this kitchen configured checkout.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
        <p className="mt-2 text-muted-foreground">Quick answers for guests ordering from {sf.publicName}.</p>
      </div>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.q} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <p className="font-semibold">{it.q}</p>
            <p className="mt-2 text-sm text-muted-foreground">{it.a}</p>
          </div>
        ))}
      </div>
      <StorefrontContactForm storeSlug={storeSlug} type="CONTACT" title="Still need help?" />
    </div>
  );
}
