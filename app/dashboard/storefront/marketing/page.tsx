import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { listStorefrontCampaigns } from "@/services/storefront/storefront-p3-list-service";

export const dynamic = "force-dynamic";

export default async function StorefrontMarketingPage() {
  const { sessionUser: user } = await getTenantActor();
  const sf = await findAdminStorefront(user.id, { id: true });
  const campaigns = sf ? await listStorefrontCampaigns(sf.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Marketing campaigns</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Email campaigns and promotions. Transactional flows remain under workspace notifications.
        </p>
      </div>

      {!sf ? (
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Set up storefront</Link>
        </Button>
      ) : campaigns.length === 0 ? (
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
