import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { listStorefrontCampaigns } from "@/services/storefront/storefront-p3-list-service";

export const dynamic = "force-dynamic";

export default async function StorefrontMarketingPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const storefrontId = pageAccess.access.storefront.id;
  const campaigns = await listStorefrontCampaigns(storefrontId);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Marketing campaigns</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Email campaigns and promotions. Transactional flows remain under workspace notifications.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-muted-foreground">No campaigns yet — create drafts via API or future builder.</p>
      ) : (
        <ul className="divide-y rounded-xl border border-border/80">
          {campaigns.map((c) => (
            <li key={c.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{c.name}</p>
              <p className="text-muted-foreground">
                {c.status} · {c.subject}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
