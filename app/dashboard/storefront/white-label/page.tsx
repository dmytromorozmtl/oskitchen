import { WhiteLabelStorefrontDepthPanel } from "@/components/dashboard/storefront/white-label-storefront-depth-panel";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadWhiteLabelStorefrontDepthModel } from "@/services/storefront/white-label-storefront-depth-service";

export default async function WhiteLabelStorefrontDepthPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const { sessionUser } = await getTenantActor();
  const model = await loadWhiteLabelStorefrontDepthModel(sessionUser.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Storefront · White-label
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          White-label storefront depth
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          ChowNow parity depth view for {model.restaurantName} — branded theme tokens, custom domain
          routing, commission-free direct ordering, catering pages, and branded PWA install. BETA
          maturity labels; Do not promise custom domains until DNS is verified.
        </p>
      </div>

      <WhiteLabelStorefrontDepthPanel model={model} />
    </div>
  );
}
