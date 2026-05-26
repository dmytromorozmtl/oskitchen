import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { listStorefrontReviews } from "@/services/storefront/storefront-p3-list-service";

export const dynamic = "force-dynamic";

export default async function StorefrontReviewsPage() {
  const { sessionUser: user } = await getTenantActor();
  const sf = await findAdminStorefront(user.id, { id: true });
  const reviews = sf ? await listStorefrontReviews(sf.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reviews &amp; ratings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Moderate post-order feedback before publishing on the storefront.</p>
      </div>

      {!sf ? (
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Set up storefront</Link>
        </Button>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="divide-y rounded-xl border border-border/80 text-sm">
          {reviews.map((r) => (
            <li key={r.id} className="px-4 py-3">
              <p className="font-medium">
                {"★".repeat(Math.min(5, Math.max(1, r.rating)))} {r.title ?? "Untitled"}
              </p>
              <p className="text-muted-foreground">{r.published ? "Published" : "Draft"}</p>
              {r.body ? <p className="mt-1">{r.body}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
