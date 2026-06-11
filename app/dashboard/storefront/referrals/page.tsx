import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { listStorefrontReferrals } from "@/services/storefront/storefront-p3-list-service";

export const dynamic = "force-dynamic";

export default async function StorefrontReferralsPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const referrals = await listStorefrontReferrals(pageAccess.access.storefront.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Referral program</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track invite codes and reward grants.</p>
      </div>

      {referrals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No referrals yet.</p>
      ) : (
        <ul className="divide-y rounded-xl border border-border/80 font-mono text-sm">
          {referrals.map((r) => (
            <li key={r.id} className="flex justify-between px-4 py-3">
              <span>{r.code}</span>
              <span className="text-muted-foreground">
                {r.referrerEmail}
                {r.rewardGranted ? " · rewarded" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
